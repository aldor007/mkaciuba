#!/usr/bin/env node

/**
 * Upload webpack build artifacts to S3
 *
 * Usage: node tools/upload-to-s3.js [directory]
 *
 * Environment variables:
 * - AWS_BUCKET: S3 bucket name
 * - AWS_REGION: AWS region
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - AWS_BASE_PATH: Base path prefix in S3 (e.g., "mkaciuba/")
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mime = require('mime-types');

// Read version from environment (set by semantic-release) or package.json
function getAppVersion() {
  // Priority: APP_VERSION env var (set by semantic-release/CI) > package.json
  if (process.env.APP_VERSION) {
    return process.env.APP_VERSION;
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
  return packageJson.version;
}

const appVersion = getAppVersion();

// Configuration
// Normalize basePath to ensure it ends with '/' if not empty
// Add version to the path for versioned assets
let basePath = process.env.AWS_BASE_PATH || '';
if (basePath && !basePath.endsWith('/')) {
  basePath += '/';
}

// Add version to basePath: e.g., "mkaciuba/" becomes "mkaciuba/0.0.13/"
if (appVersion) {
  basePath = basePath + appVersion + '/';
}

// Parse command line arguments
const isDryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');
const distDirArg = process.argv.find(arg => !arg.includes('--') && arg !== process.argv[0] && arg !== process.argv[1]);

const config = {
  bucket: process.env.AWS_BUCKET,
  region: process.env.AWS_REGION,
  basePath: basePath,
  distDir: distDirArg || 'dist/apps/photos',
  dryRun: isDryRun
};

// Validation
if (!config.bucket || !config.region) {
  console.log('⚠️  S3 Upload: AWS credentials not configured, skipping upload');
  process.exit(0);
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('⚠️  S3 Upload: AWS credentials missing, skipping upload');
  process.exit(0);
}

// Validate distDir exists
if (!fs.existsSync(config.distDir)) {
  console.error(`❌ Error: Distribution directory not found: ${config.distDir}`);
  console.error('   Make sure to build the project first: yarn nx build photos --configuration=production');
  process.exit(1);
}

// Initialize S3 client
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

console.log('🔵 S3 Upload: Starting upload to S3...');
if (config.dryRun) {
  console.log('🔵 DRY RUN MODE - No files will be uploaded');
}
console.log('🔵 App Version:', appVersion);
console.log('🔵 S3 Config:', {
  bucket: config.bucket,
  region: config.region,
  basePath: config.basePath || '(root)',
  distDir: config.distDir,
  dryRun: config.dryRun
});
console.log('🔵 S3 Base URL: https://' + config.bucket + '.s3.' + config.region + '.amazonaws.com/' + encodeURIComponent(config.basePath).replace(/%2F/g, '/'));
console.log('🔵 Assets will be uploaded with version prefix: ' + appVersion);
console.log('🔵 Example paths:');
console.log('   Local: dist/apps/photos/main.js');
console.log('   S3 Key: ' + config.basePath + 'main.js');
console.log('   Full URL: https://' + config.bucket + '.s3.' + config.region + '.amazonaws.com/' + config.basePath + 'main.js');

/**
 * Get all files to upload (exclude source maps and other non-essential files)
 */
function getFilesToUpload() {
  const patterns = [
    '**/*.js',
    '**/*.css',
    '**/*.html',
    '**/*.json',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.woff',
    '**/*.woff2',
    '**/*.ttf',
    '**/*.eot'
  ];

  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      cwd: config.distDir,
      nodir: true,
      ignore: ['**/*.map', '**/node_modules/**']
    });
    files.push(...matches);
  });

  return [...new Set(files)]; // Remove duplicates
}

/**
 * Execute promises with concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} fn - Async function to execute for each item
 * @param {number} limit - Maximum concurrent operations
 */
async function pLimit(items, fn, limit = 10) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = Promise.resolve().then(() => fn(item));
    results.push(promise);

    if (limit <= items.length) {
      const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

/**
 * Upload a single file to S3 with retry logic
 * @param {string} filePath - Relative path to file
 * @param {number} retries - Number of retries remaining
 */
async function uploadFile(filePath, retries = 2) {
  const fullPath = path.join(config.distDir, filePath);
  const fileContent = fs.readFileSync(fullPath);

  // Normalize path separators for S3 (always use forward slashes, even on Windows)
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Construct S3 key by joining basePath and filePath
  // basePath already has trailing '/' if not empty (normalized during config)
  const s3Key = config.basePath + normalizedPath;
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  // Determine cache control based on file type
  let cacheControl;
  if (filePath.endsWith('.html') || filePath === 'manifest.json') {
    cacheControl = 'no-cache'; // HTML and manifest should not be cached
  } else {
    cacheControl = 'public, max-age=31536000'; // 1 year for hashed assets
  }

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl
  });

  try {
    // Dry run mode - skip actual upload
    if (config.dryRun) {
      const encodedKey = s3Key.split('/').map(encodeURIComponent).join('/');
      const s3Url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${encodedKey}`;
      return { success: true, file: filePath, key: s3Key, url: s3Url, dryRun: true };
    }

    await s3Client.send(command);
    // Encode S3 key for URL, but keep forward slashes unencoded
    const encodedKey = s3Key.split('/').map(encodeURIComponent).join('/');
    const s3Url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${encodedKey}`;
    return { success: true, file: filePath, key: s3Key, url: s3Url };
  } catch (error) {
    // Retry on network errors
    if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.name === 'NetworkError')) {
      console.log(`   ⚠️  Retrying ${filePath} (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return uploadFile(filePath, retries - 1);
    }
    return { success: false, file: filePath, key: s3Key, error: error.message };
  }
}

/**
 * Verify file exists in S3
 */
async function verifyFile(s3Key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: config.bucket,
      Key: s3Key
    }));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main upload function
 */
async function main() {
  const files = getFilesToUpload();

  if (files.length === 0) {
    console.error(`❌ No files found to upload in: ${config.distDir}`);
    console.error('   Make sure the build completed successfully');
    process.exit(1);
  }

  console.log(`🔵 Found ${files.length} files to upload`);

  // Show sample S3 keys that will be generated
  console.log(`\n🔑 Sample S3 keys (showing how files will be uploaded):`);
  const sampleFiles = files.filter(f =>
    f === 'manifest.json' ||
    f.includes('main.') ||
    f.match(/^\d+\..*\.(js|css)$/)
  ).slice(0, 5);

  sampleFiles.forEach(f => {
    const s3Key = config.basePath + f;
    console.log(`   ${f} → ${s3Key}`);
  });

  // Upload all files with concurrency limit (10 at a time to avoid rate limits)
  console.log(`🔵 Uploading with concurrency limit of 10...`);
  const results = await pLimit(files, uploadFile, 10);

  // Report results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n📊 Upload Results:`);
  if (config.dryRun) {
    console.log(`   🔵 DRY RUN - No files were actually uploaded`);
  }
  console.log(`   ✅ Successful: ${successful.length}/${files.length}`);

  if (failed.length > 0) {
    console.log(`   ❌ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`      - ${f.file}: ${f.error}`);
    });
  }

  // Show sample of uploaded files with their URLs
  console.log(`\n📤 Sample uploaded files:`);
  const importantFiles = successful.filter(f =>
    f.file === 'manifest.json' ||
    f.file.includes('main.') ||
    f.file.endsWith('.css') ||
    f.file === 'index.html'
  ).slice(0, 10);

  importantFiles.forEach(f => {
    console.log(`   ✅ ${f.file}`);
    console.log(`      → ${f.url}`);
  });

  // Verify critical files (CSS and manifest)
  console.log(`\n🔍 Verifying critical files...`);
  const criticalFiles = files.filter(f => f.endsWith('.css') || f === 'manifest.json');
  // Verify up to 20 critical files to ensure they're properly uploaded
  const filesToVerify = criticalFiles.slice(0, 20);
  console.log(`   Checking ${filesToVerify.length} critical files (${criticalFiles.length} total)...`);
  const verifications = await Promise.all(
    filesToVerify.map(async f => ({
      file: f,
      exists: await verifyFile(config.basePath + f.replace(/\\/g, '/'))
    }))
  );

  const verified = verifications.filter(v => v.exists).length;
  console.log(`   ✅ Verified: ${verified}/${verifications.length} critical files`);

  verifications.forEach(v => {
    console.log(`   ${v.exists ? '✅' : '❌'} ${v.file}`);
  });

  if (failed.length > 0 || verified < verifications.length) {
    console.log('\n❌ S3 upload incomplete');
    process.exit(1);
  }

  console.log('\n✅ S3 upload completed successfully!');
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error during S3 upload:', error);
  process.exit(1);
});

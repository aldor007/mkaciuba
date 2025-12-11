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

// Configuration
const config = {
  bucket: process.env.AWS_BUCKET,
  region: process.env.AWS_REGION,
  basePath: process.env.AWS_BASE_PATH || '',
  distDir: process.argv[2] || 'dist/apps/photos'
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

// Initialize S3 client
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

console.log('🔵 S3 Upload: Starting upload to S3...');
console.log('🔵 S3 Config:', {
  bucket: config.bucket.substring(0, 3) + '***',
  region: config.region,
  basePath: config.basePath ? config.basePath + '***' : '(root)',
  distDir: config.distDir
});

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
 * Upload a single file to S3
 */
async function uploadFile(filePath) {
  const fullPath = path.join(config.distDir, filePath);
  const fileContent = fs.readFileSync(fullPath);
  const s3Key = config.basePath + filePath;
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: filePath.endsWith('.html')
      ? 'no-cache'
      : 'public, max-age=31536000' // 1 year for hashed assets
  });

  try {
    await s3Client.send(command);
    return { success: true, file: filePath, key: s3Key };
  } catch (error) {
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
    console.log('⚠️  No files found to upload');
    process.exit(1);
  }

  console.log(`🔵 Found ${files.length} files to upload`);

  // Upload all files
  const results = await Promise.all(files.map(uploadFile));

  // Report results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n📊 Upload Results:`);
  console.log(`   ✅ Successful: ${successful.length}/${files.length}`);

  if (failed.length > 0) {
    console.log(`   ❌ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`      - ${f.file}: ${f.error}`);
    });
  }

  // Verify critical files (CSS and manifest)
  console.log(`\n🔍 Verifying critical files...`);
  const criticalFiles = files.filter(f => f.endsWith('.css') || f === 'manifest.json');
  const verifications = await Promise.all(
    criticalFiles.slice(0, 5).map(async f => ({
      file: f,
      exists: await verifyFile(config.basePath + f)
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

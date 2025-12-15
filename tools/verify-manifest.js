#!/usr/bin/env node

/**
 * Verify that all files referenced in manifest.json exist in the dist folder
 *
 * Usage: node tools/verify-manifest.js [dist-dir]
 *
 * Exit codes:
 * - 0: All files exist
 * - 1: Some files are missing or manifest.json not found
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const distDirArg = process.argv.find(arg => !arg.includes('--') && arg !== process.argv[0] && arg !== process.argv[1]);
const distDir = distDirArg || 'dist/apps/photos';
const manifestPath = path.join(distDir, 'manifest.json');

console.log('🔍 Manifest Verification');
console.log('📁 Distribution directory:', distDir);
console.log('📄 Manifest path:', manifestPath);

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error(`❌ Error: Distribution directory not found: ${distDir}`);
  console.error('   Make sure to build the project first: yarn nx build photos --configuration=production');
  process.exit(1);
}

// Check if manifest.json exists
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Error: manifest.json not found at: ${manifestPath}`);
  console.error('   Make sure the build completed successfully');
  process.exit(1);
}

// Read manifest.json
let manifest;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  manifest = JSON.parse(manifestContent);
  console.log('✅ manifest.json loaded successfully');
  console.log(`📊 Manifest contains ${Object.keys(manifest).length} entries`);
} catch (error) {
  console.error(`❌ Error reading manifest.json: ${error.message}`);
  process.exit(1);
}

// Verify each file in manifest
console.log('\n🔍 Verifying files...');
const results = [];
let allExist = true;

for (const [key, value] of Object.entries(manifest)) {
  const filePath = path.join(distDir, value);
  const exists = fs.existsSync(filePath);

  results.push({
    key,
    value,
    path: filePath,
    exists
  });

  if (!exists) {
    allExist = false;
  }
}

// Display results
const existing = results.filter(r => r.exists);
const missing = results.filter(r => !r.exists);

console.log(`\n📊 Verification Results:`);
console.log(`   ✅ Existing: ${existing.length}/${results.length}`);
console.log(`   ❌ Missing: ${missing.length}/${results.length}`);

// Show sample of existing files
if (existing.length > 0) {
  console.log(`\n✅ Sample existing files:`);
  const samples = existing.filter(r =>
    r.key === 'main.js' ||
    r.key === 'main.css' ||
    r.key === 'runtime.js' ||
    r.key === 'manifest.json' ||
    r.key.includes('assets/')
  ).slice(0, 10);

  samples.forEach(r => {
    const size = fs.statSync(r.path).size;
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`   ✅ ${r.key} → ${r.value} (${sizeKB} KB)`);
  });
}

// Show all missing files
if (missing.length > 0) {
  console.log(`\n❌ Missing files:`);
  missing.forEach(r => {
    console.log(`   ❌ ${r.key} → ${r.value}`);
    console.log(`      Expected at: ${r.path}`);
  });
}

// Additional checks for critical files
console.log(`\n🔍 Critical files check:`);
const criticalFiles = [
  'main.js',
  'main.css',
  'runtime.js',
  'manifest.json'
];

let criticalMissing = false;
criticalFiles.forEach(key => {
  const result = results.find(r => r.key === key);
  if (result) {
    if (result.exists) {
      const size = fs.statSync(result.path).size;
      const sizeKB = (size / 1024).toFixed(2);
      console.log(`   ✅ ${key}: ${result.value} (${sizeKB} KB)`);
    } else {
      console.log(`   ❌ ${key}: MISSING`);
      criticalMissing = true;
    }
  } else {
    console.log(`   ⚠️  ${key}: Not in manifest`);
  }
});

// Check for CSS files
const cssFiles = results.filter(r => r.value.endsWith('.css'));
console.log(`\n🎨 CSS files: ${cssFiles.length} total`);
cssFiles.forEach(r => {
  const status = r.exists ? '✅' : '❌';
  if (r.exists) {
    const size = fs.statSync(r.path).size;
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`   ${status} ${r.key} → ${r.value} (${sizeKB} KB)`);
  } else {
    console.log(`   ${status} ${r.key} → ${r.value} (MISSING)`);
  }
});

// Final summary
if (allExist && !criticalMissing) {
  console.log('\n✅ All files from manifest.json exist in dist folder!');
  process.exit(0);
} else {
  console.log('\n❌ Some files are missing!');
  console.log('   This may indicate a build issue or incomplete artifact copy.');
  console.log('   Make sure the GitHub Actions workflow properly copies dist/ folder to Docker context.');
  process.exit(1);
}

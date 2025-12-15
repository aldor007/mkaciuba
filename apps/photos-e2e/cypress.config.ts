import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename),
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    specPattern: './src/integration/**/*.spec.ts',
    supportFile: './src/support/index.ts',
    video: true,
    videosFolder: '../../dist/cypress/apps/photos-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/photos-e2e/screenshots',
    chromeWebSecurity: false,
    baseUrl: 'http://localhost:3333',
    // Enable experimental parallel spec execution
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    // Increased retries for flaky test resilience
    retries: {
      runMode: 4,    // Retry 4 times in CI/headless (total 5 attempts)
      openMode: 0,   // No retries in interactive mode for faster debugging
    },
    // Increase timeouts for better reliability (GraphQL can be slow)
    defaultCommandTimeout: 15000,  // 15s (default: 4s)
    pageLoadTimeout: 90000,         // 90s (default: 60s)
    requestTimeout: 20000,          // 20s (default: 5s)
    setupNodeEvents(on, config) {
      // Custom task to log to Node.js console (visible in GitHub Actions)
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        logError(data) {
          console.log('\n\n');
          console.log('╔═══════════════════════════════════════════════════════════╗');
          console.log('║         🔴 HYDRATION ERROR DETECTED                      ║');
          console.log('╚═══════════════════════════════════════════════════════════╝');
          console.log('\n📍 TEST INFORMATION:');
          console.log(`   Test: ${data.test}`);
          console.log(`   Suite: ${data.suite}`);
          console.log('\n💥 ERROR DETAILS:');
          console.log(`   Message: ${data.message}`);
          console.log('\n📚 STACK TRACE:');
          console.log(data.stack);

          if (data.warnings && data.warnings.length > 0) {
            console.log('\n\n📋 RELATED HYDRATION WARNINGS (' + data.warnings.length + ' total):');
            console.log('─────────────────────────────────────────────────────────');
            data.warnings.forEach((warning: string, idx: number) => {
              console.log(`\n[${idx + 1}/${data.warnings.length}]`);
              console.log(warning);
              console.log('─────────────────────────────────────────────────────────');
            });
          }

          if (data.allErrors && data.allErrors.length > 0) {
            console.log('\n\n📝 ALL CONSOLE ERRORS (last 10):');
            console.log('─────────────────────────────────────────────────────────');
            const recentErrors = data.allErrors.slice(-10);
            recentErrors.forEach((error: string, idx: number) => {
              console.log(`\n[${idx + 1}/${recentErrors.length}]`);
              console.log(error);
              console.log('─────────────────────────────────────────────────────────');
            });
          }

          if (data.domInfo) {
            console.log('\n\n📄 CURRENT DOM STATE:');
            console.log('─────────────────────────────────────────────────────────');
            console.log(`   URL: ${data.domInfo.url}`);
            console.log(`   Path: ${data.domInfo.path}`);
            console.log(`   Body classes: ${data.domInfo.bodyClasses || 'none'}`);
            console.log(`   Direct children: ${data.domInfo.childCount}`);
            if (data.domInfo.reactRoot) {
              console.log(`   React root found: ${data.domInfo.reactRoot}`);
            }
            if (data.domInfo.suppressedElements > 0) {
              console.log(`   Elements with suppressHydrationWarning: ${data.domInfo.suppressedElements}`);
            }
            console.log('\n   Body HTML (first 1000 chars):');
            console.log(data.domInfo.bodyHtml);
          }

          console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
          console.log('║         END OF HYDRATION ERROR REPORT                    ║');
          console.log('╚═══════════════════════════════════════════════════════════╝\n\n');

          return null;
        }
      });
      return config;
    },
  },
});

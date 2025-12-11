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
    // Increased retries for flaky test resilience
    retries: {
      runMode: 4,    // Retry 4 times in CI/headless (total 5 attempts)
      openMode: 0,   // No retries in interactive mode for faster debugging
    },
    // Increase timeouts for better reliability (GraphQL can be slow)
    defaultCommandTimeout: 15000,  // 15s (default: 4s)
    pageLoadTimeout: 90000,         // 90s (default: 60s)
    requestTimeout: 20000,          // 20s (default: 5s)
  },
});

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
    // Retry failed tests up to 3 times before marking as failed
    retries: {
      runMode: 2,    // Retry 2 times in CI/headless (total 3 attempts)
      openMode: 0,   // No retries in interactive mode for faster debugging
    },
  },
});

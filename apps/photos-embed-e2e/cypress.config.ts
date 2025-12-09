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
    videosFolder: '../../dist/cypress/apps/photos-embed-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/photos-embed-e2e/screenshots',
    chromeWebSecurity: false,
    baseUrl: 'http://localhost:3333',
  },
});

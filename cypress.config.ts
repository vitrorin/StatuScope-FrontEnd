import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    viewportWidth: 1440,
    viewportHeight: 900,
    screenshotsFolder: 'cypress/screenshots',
    video: false,
    defaultCommandTimeout: 8000,
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
});

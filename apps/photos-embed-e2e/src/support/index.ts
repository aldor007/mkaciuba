// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Handle uncaught exceptions from third-party libraries
Cypress.on('uncaught:exception', (err) => {
  // Ignore Facebook SDK errors - the SDK may not be loaded in test environment
  if (err.message.includes('Cannot read properties of undefined (reading \'XFBML\')') ||
      err.message.includes('FB is not defined')) {
    return false;
  }
  // Allow other errors to fail the test
  return true;
});

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
import './commands';

// Capture React hydration warnings for better debugging
let hydrationWarnings: string[] = [];

// Intercept console errors to capture hydration details
Cypress.on('window:before:load', (win) => {
  const originalConsoleError = win.console.error;
  win.console.error = function (...args: any[]) {
    const message = args.join(' ');

    // Capture hydration warnings
    if (message.includes('Warning: Did not expect server HTML') ||
        message.includes('Hydration failed') ||
        message.includes('There was an error while hydrating')) {
      hydrationWarnings.push(message);
      cy.log('🔴 Hydration Warning Detected:', message);
    }

    // Still call original console.error
    originalConsoleError.apply(win.console, args);
  };
});

// Handle uncaught exceptions from third-party libraries
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore Facebook SDK errors - the SDK may not be loaded in test environment
  if (err.message.includes('Cannot read properties of undefined (reading \'XFBML\')') ||
      err.message.includes('FB is not defined')) {
    return false;
  }

  // Enhanced logging for hydration errors
  if (err.message.includes('Hydration failed') ||
      err.message.includes('does not match what was rendered on the server')) {
    cy.log('🔴 HYDRATION ERROR DETECTED');
    cy.log('Error Message:', err.message);
    cy.log('Stack:', err.stack);

    // Log any captured hydration warnings
    if (hydrationWarnings.length > 0) {
      cy.log('📋 Related Hydration Warnings:');
      hydrationWarnings.forEach((warning, idx) => {
        cy.log(`Warning ${idx + 1}:`, warning);
      });
    }

    // Try to extract the element that caused the mismatch
    cy.window().then((win) => {
      const body = win.document.body;
      cy.log('📄 Document Body HTML (first 500 chars):', body.innerHTML.substring(0, 500));

      // Check for any elements with suppressHydrationWarning issues
      const elementsWithData = body.querySelectorAll('[data-reactroot], [data-reactid]');
      if (elementsWithData.length > 0) {
        cy.log(`Found ${elementsWithData.length} React root elements`);
      }
    });

    // Clear warnings for next test
    hydrationWarnings = [];
  }

  // Log all other errors with context
  cy.log('🔴 Uncaught Exception:', err.message);
  cy.log('Test:', runnable.title);

  // Allow other errors to fail the test
  return true;
});

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
      // Use Cypress.log programmatic API instead of cy.log
      Cypress.log({
        name: '🔴 Hydration Warning',
        message: message.substring(0, 200),
        consoleProps: () => ({ 'Full Message': message })
      });
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

  // Enhanced logging for hydration errors using programmatic API
  if (err.message.includes('Hydration failed') ||
      err.message.includes('does not match what was rendered on the server')) {

    console.log('═══════════════════════════════════════════════');
    console.log('🔴 HYDRATION ERROR DETECTED');
    console.log('═══════════════════════════════════════════════');
    console.log('Test:', runnable.title);
    console.log('Error Message:', err.message);
    console.log('Stack:', err.stack);

    // Log any captured hydration warnings
    if (hydrationWarnings.length > 0) {
      console.log('\n📋 Related Hydration Warnings:');
      hydrationWarnings.forEach((warning, idx) => {
        console.log(`\nWarning ${idx + 1}:`);
        console.log(warning);
      });
    }

    // Try to extract DOM information
    try {
      if (typeof window !== 'undefined' && window.document) {
        const body = window.document.body;
        if (body) {
          console.log('\n📄 Document Body HTML (first 500 chars):');
          console.log(body.innerHTML.substring(0, 500));

          // Check for React root elements
          const elementsWithData = body.querySelectorAll('[data-reactroot], [data-reactid]');
          if (elementsWithData.length > 0) {
            console.log(`\nFound ${elementsWithData.length} React root elements`);
          }
        }
      }
    } catch (domError) {
      console.log('Could not extract DOM information:', domError);
    }

    console.log('═══════════════════════════════════════════════\n');

    // Clear warnings for next test
    hydrationWarnings = [];

    // Use programmatic log for Cypress UI
    Cypress.log({
      name: '🔴 Hydration Error',
      message: err.message,
      consoleProps: () => ({
        'Error': err.message,
        'Stack': err.stack,
        'Test': runnable.title,
        'Warnings': hydrationWarnings
      })
    });
  } else {
    // Log all other errors
    console.log('🔴 Uncaught Exception:', err.message);
    console.log('Test:', runnable.title);
  }

  // Allow errors to fail the test
  return true;
});

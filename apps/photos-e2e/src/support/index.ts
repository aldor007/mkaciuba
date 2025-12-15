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
let allConsoleErrors: string[] = [];
let lastHydrationError: any = null;

// Intercept console errors to capture hydration details
Cypress.on('window:before:load', (win) => {
  const originalConsoleError = win.console.error;
  const originalConsoleWarn = win.console.warn;
  const originalConsoleLog = win.console.log;

  // Helper to format console arguments
  const formatMessage = (args: any[]) => {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  };

  // Check if message is hydration-related
  const isHydrationMessage = (message: string) => {
    return message.includes('Warning: Did not expect server HTML') ||
        message.includes('Hydration failed') ||
        message.includes('Hydration mismatch') ||
        message.includes('hydration') ||
        message.includes('There was an error while hydrating') ||
        message.includes('Text content does not match') ||
        message.includes('does not match server-rendered HTML') ||
        message.includes('suppressHydrationWarning') ||
        (message.includes('Prop') && message.includes('did not match')) ||
        message.includes('Expected server HTML');
  };

  win.console.error = function (...args: any[]) {
    const message = formatMessage(args);

    // Store all console errors with timestamp
    allConsoleErrors.push(`[ERROR ${new Date().toISOString()}] ${message}`);

    // Capture hydration warnings
    if (isHydrationMessage(message)) {
      hydrationWarnings.push(`[console.error] ${message}`);

      // Use Cypress.log programmatic API for Cypress UI
      Cypress.log({
        name: '🔴 Hydration Warning',
        message: message.substring(0, 200),
        consoleProps: () => ({ 'Full Message': message })
      });
    }

    // Still call original console.error
    originalConsoleError.apply(win.console, args);
  };

  win.console.warn = function (...args: any[]) {
    const message = formatMessage(args);

    // Store warnings too
    allConsoleErrors.push(`[WARN ${new Date().toISOString()}] ${message}`);

    // Capture hydration-related warnings
    if (isHydrationMessage(message)) {
      hydrationWarnings.push(`[console.warn] ${message}`);
    }

    originalConsoleWarn.apply(win.console, args);
  };

  // Also capture console.log in case React logs there
  win.console.log = function (...args: any[]) {
    const message = formatMessage(args);

    // Only store if hydration-related
    if (isHydrationMessage(message)) {
      allConsoleErrors.push(`[LOG ${new Date().toISOString()}] ${message}`);
      hydrationWarnings.push(`[console.log] ${message}`);
    }

    originalConsoleLog.apply(win.console, args);
  };
});

// Handle uncaught exceptions from third-party libraries
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore Facebook SDK errors - the SDK may not be loaded in test environment
  if (err.message.includes('Cannot read properties of undefined (reading \'XFBML\')') ||
      err.message.includes('FB is not defined')) {
    return false;
  }

  // Enhanced logging for hydration errors using Cypress tasks (visible in GitHub Actions)
  const isHydrationError = err.message.includes('Hydration failed') ||
      err.message.includes('does not match what was rendered on the server') ||
      err.message.includes('Hydration') ||
      err.message.includes('hydration');

  if (isHydrationError) {
    // Collect DOM information
    let domInfo = null;
    try {
      if (typeof window !== 'undefined' && window.document) {
        const body = window.document.body;
        if (body) {
          const reactRoot = body.querySelector('#root, [data-reactroot], [data-reactid]');
          const suppressedElements = body.querySelectorAll('[suppresshydrationwarning]');

          domInfo = {
            url: window.location.href,
            path: window.location.pathname,
            bodyClasses: body.className || 'none',
            childCount: body.children.length,
            reactRoot: reactRoot ? `${reactRoot.tagName} ${reactRoot.id ? '#' + reactRoot.id : ''}` : null,
            suppressedElements: suppressedElements.length,
            bodyHtml: body.innerHTML.substring(0, 1000) + (body.innerHTML.length > 1000 ? `\n... (${body.innerHTML.length - 1000} more characters)` : '')
          };
        }
      }
    } catch (domError) {
      domInfo = { error: 'Could not extract DOM information: ' + String(domError) };
    }

    // Store error information to be logged in afterEach hook
    lastHydrationError = {
      test: runnable.title,
      suite: runnable.parent?.title || 'N/A',
      message: err.message,
      stack: err.stack,
      warnings: hydrationWarnings.length > 0 ? [...hydrationWarnings] : null,
      allErrors: allConsoleErrors.length > 0 ? allConsoleErrors.slice(-10) : null,
      domInfo: domInfo
    };

    // Use programmatic log for Cypress UI
    Cypress.log({
      name: '🔴 Hydration Error',
      message: err.message,
      consoleProps: () => ({
        'Error': err.message,
        'Stack': err.stack,
        'Test': runnable.title,
        'Suite': runnable.parent?.title,
        'Hydration Warnings': hydrationWarnings,
        'All Console Errors': allConsoleErrors,
        'DOM Info': domInfo
      })
    });

    // Clear for next test
    hydrationWarnings = [];
    allConsoleErrors = [];
  }

  // Allow errors to fail the test
  return true;
});

// Log hydration errors to Node.js console after each test (visible in GitHub Actions)
afterEach(function() {
  if (lastHydrationError) {
    cy.task('logError', lastHydrationError, { log: false });
    lastHydrationError = null;
  }
});

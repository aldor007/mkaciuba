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

// Intercept console errors to capture hydration details
Cypress.on('window:before:load', (win) => {
  console.log('🔧 Setting up console interception for:', win.location.href);

  const originalConsoleError = win.console.error;
  const originalConsoleWarn = win.console.warn;

  win.console.error = function (...args: any[]) {
    console.log('📢 Console.error intercepted, args:', args.length);
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Store all console errors
    allConsoleErrors.push(message);

    // Capture hydration warnings
    if (message.includes('Warning: Did not expect server HTML') ||
        message.includes('Hydration failed') ||
        message.includes('Hydration mismatch') ||
        message.includes('There was an error while hydrating') ||
        message.includes('Text content does not match') ||
        message.includes('Prop') && message.includes('did not match')) {
      hydrationWarnings.push(message);

      console.log('\n🔴 CAPTURED HYDRATION WARNING:');
      console.log(message);
      console.log('─────────────────────────────────────────────\n');

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

  win.console.warn = function (...args: any[]) {
    const message = args.map(arg => String(arg)).join(' ');

    // Capture hydration-related warnings
    if (message.includes('hydration') ||
        message.includes('Did not expect server HTML') ||
        message.includes('suppressHydrationWarning')) {
      hydrationWarnings.push(`[WARN] ${message}`);
      console.log('\n⚠️  CAPTURED HYDRATION WARNING:');
      console.log(message);
      console.log('─────────────────────────────────────────────\n');
    }

    originalConsoleWarn.apply(win.console, args);
  };
});

// Handle uncaught exceptions from third-party libraries
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log EVERY error to see what's happening
  console.log('\n\n🔍 EXCEPTION HANDLER TRIGGERED');
  console.log('Error message:', err.message);
  console.log('Error type:', typeof err.message);
  console.log('Contains "Hydration failed"?', err.message.includes('Hydration failed'));
  console.log('Contains "does not match"?', err.message.includes('does not match'));

  // Ignore Facebook SDK errors - the SDK may not be loaded in test environment
  if (err.message.includes('Cannot read properties of undefined (reading \'XFBML\')') ||
      err.message.includes('FB is not defined')) {
    console.log('⏭️  Ignoring Facebook SDK error');
    return false;
  }

  // Enhanced logging for hydration errors using programmatic API
  const isHydrationError = err.message.includes('Hydration failed') ||
      err.message.includes('does not match what was rendered on the server') ||
      err.message.includes('Hydration') ||
      err.message.includes('hydration');

  console.log('Is hydration error?', isHydrationError);

  if (isHydrationError) {

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         🔴 HYDRATION ERROR DETECTED                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📍 TEST INFORMATION:');
    console.log(`   Test: ${runnable.title}`);
    console.log(`   Suite: ${runnable.parent?.title || 'N/A'}`);

    console.log('\n💥 ERROR DETAILS:');
    console.log(`   Message: ${err.message}`);
    console.log(`   Name: ${err.name}`);

    console.log('\n📚 STACK TRACE:');
    console.log(err.stack);

    // Log any captured hydration warnings
    if (hydrationWarnings.length > 0) {
      console.log('\n\n📋 RELATED HYDRATION WARNINGS (' + hydrationWarnings.length + ' total):');
      console.log('─────────────────────────────────────────────────────────');
      hydrationWarnings.forEach((warning, idx) => {
        console.log(`\n[${idx + 1}/${hydrationWarnings.length}]`);
        console.log(warning);
        console.log('─────────────────────────────────────────────────────────');
      });
    } else {
      console.log('\n\n⚠️  No hydration warnings were captured before this error.');
      console.log('   This might indicate the error occurred before React could log warnings.');
    }

    // Log all console errors for context
    if (allConsoleErrors.length > 0) {
      console.log('\n\n📝 ALL CONSOLE ERRORS (last 10):');
      console.log('─────────────────────────────────────────────────────────');
      const recentErrors = allConsoleErrors.slice(-10);
      recentErrors.forEach((error, idx) => {
        console.log(`\n[${idx + 1}/${recentErrors.length}]`);
        console.log(error);
        console.log('─────────────────────────────────────────────────────────');
      });
    }

    // Try to extract DOM information
    try {
      if (typeof window !== 'undefined' && window.document) {
        const body = window.document.body;
        if (body) {
          console.log('\n\n📄 CURRENT DOM STATE:');
          console.log('─────────────────────────────────────────────────────────');

          // Get current URL
          console.log(`   URL: ${window.location.href}`);
          console.log(`   Path: ${window.location.pathname}`);

          // Document structure
          console.log(`   Body classes: ${body.className || 'none'}`);
          console.log(`   Direct children: ${body.children.length}`);

          // React root detection
          const reactRoot = body.querySelector('#root, [data-reactroot], [data-reactid]');
          if (reactRoot) {
            console.log(`   React root found: ${reactRoot.tagName} ${reactRoot.id ? '#' + reactRoot.id : ''}`);
          }

          // Find elements with suppressHydrationWarning
          const suppressedElements = body.querySelectorAll('[suppresshydrationwarning]');
          if (suppressedElements.length > 0) {
            console.log(`   Elements with suppressHydrationWarning: ${suppressedElements.length}`);
          }

          console.log('\n   Body HTML (first 1000 chars):');
          console.log(body.innerHTML.substring(0, 1000));

          if (body.innerHTML.length > 1000) {
            console.log(`   ... (${body.innerHTML.length - 1000} more characters)`);
          }
        }
      }
    } catch (domError) {
      console.log('\n❌ Could not extract DOM information:', domError);
    }

    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         END OF HYDRATION ERROR REPORT                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n\n');

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
        'URL': typeof window !== 'undefined' ? window.location.href : 'N/A'
      })
    });

    // Clear for next test
    hydrationWarnings = [];
    allConsoleErrors = [];

  } else {
    // Log all other errors with context
    console.log('\n🔴 UNCAUGHT EXCEPTION:');
    console.log(`   Test: ${runnable.title}`);
    console.log(`   Error: ${err.message}`);
    if (hydrationWarnings.length > 0) {
      console.log(`   Note: ${hydrationWarnings.length} hydration warnings were captured`);
    }
    console.log('');
  }

  // Allow errors to fail the test
  return true;
});

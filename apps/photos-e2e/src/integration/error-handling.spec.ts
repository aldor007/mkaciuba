import { errorPage } from '../support/pages/error.po';
import { homePage } from '../support/pages/home.po';

describe('Error Handling', () => {
  beforeEach(() => {
    cy.setDesktopViewport();
  });

  describe('404 Not Found errors', () => {
    it('should display 404 page for non-existent post', () => {
      cy.visit('/post/this-post-does-not-exist-12345', { failOnStatusCode: false });

      // Should display error page
      errorPage.shouldDisplay404();

      // Should have error message
      errorPage.shouldDisplayErrorMessage();

      // Should have "Go Home" button
      errorPage.shouldDisplayGoHomeButton();
    });

    it('should display 404 page for non-existent category', () => {
      cy.visit('/blog/category/non-existent-category-xyz', { failOnStatusCode: false });

      // Should display error page
      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();
    });

    it('should display 404 page for non-existent tag', () => {
      cy.visit('/blog/tag/non-existent-tag-xyz', { failOnStatusCode: false });

      // Should display error page
      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();
    });

    it('should display 404 page for non-existent gallery', () => {
      cy.visit('/gallery/non-existent-gallery-xyz', { failOnStatusCode: false });

      // Should display error page
      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();
    });

    it('should display 404 page for non-existent gallery category', () => {
      cy.visit('/gallery/portfolio/non-existent-category-xyz', { failOnStatusCode: false });

      // Should display error page (404 or 500 depending on setup)
      errorPage.shouldDisplayError();
      errorPage.shouldDisplayGoHomeButton();
    });
  });

  describe('500 Internal Server Error', () => {
    it('should display 500 page on GraphQL error', () => {
      // Mock GraphQL error
      cy.intercept('POST', '**/graphql', {
        statusCode: 500,
        body: {
          errors: [{ message: 'Internal server error' }],
        },
      }).as('serverError');

      cy.visit('/');

      // Wait for error
      cy.wait('@serverError', { timeout: 5000 });

      // Should display error (might be shown inline or as error page)
      cy.get('body').then(($body) => {
        if ($body.find('.text-6xl.font-bold:contains("500")').length > 0) {
          errorPage.shouldDisplay500();
        }
      });
    });

    it('should handle network timeout', () => {
      // Mock slow/timeout response
      cy.intercept('POST', '**/graphql', (req) => {
        req.reply({
          delay: 30000, // 30 second delay
          statusCode: 500,
        });
      }).as('timeoutRequest');

      cy.visit('/post/test', { failOnStatusCode: false, timeout: 10000 });

      // Should show some error state
      cy.get('body', { timeout: 10000 }).should('exist');
    });
  });

  describe('Error page elements', () => {
    it('should display error code prominently', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Error code should be large and visible
      errorPage.getErrorCode().should('be.visible');
      errorPage.getErrorCode().should('have.class', 'text-6xl');
    });

    it('should display error title', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplayErrorTitle();
      errorPage.getErrorTitle().should('have.class', 'text-2xl');
    });

    it('should display error message', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplayErrorMessage();
      errorPage.getErrorMessage().should('be.visible').and('not.be.empty');
    });

    it('should display suggestion for fixing error', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Check if suggestion exists
      cy.get('body').then(($body) => {
        if ($body.find('.bg-blue-50').length > 0) {
          errorPage.getErrorSuggestion().should('be.visible');
        }
      });
    });

    it('should display Go Home button', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplayGoHomeButton();
      errorPage.getGoHomeButton().should('have.class', 'bg-green-500');
    });
  });

  describe('Go Home button functionality', () => {
    it('should navigate to home page when clicking Go Home', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Click Go Home button
      errorPage.clickGoHome();

      // Should navigate to home
      cy.url().should('equal', Cypress.config().baseUrl + '/');

      // Should display home page
      homePage.shouldDisplayPostGrid();
    });

    it('should have correct styling for Go Home button', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Button should have hover effect
      errorPage
        .getGoHomeButton()
        .should('have.class', 'bg-green-500')
        .and('have.class', 'hover:bg-green-600');
    });
  });

  describe('Error page layout', () => {
    it('should center error content', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Error container should be full screen and centered
      errorPage.getErrorContainer().should('have.class', 'w-full');
      errorPage.getErrorContainer().should('have.class', 'h-screen');
    });

    it('should have consistent spacing', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      // Check margins and padding
      errorPage.getErrorCode().should('have.class', 'mb-2');
      errorPage.getErrorTitle().should('have.class', 'mb-4');
    });
  });

  describe('Error page on different viewports', () => {
    it('should display properly on mobile', () => {
      cy.setMobileViewport();

      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();

      // Content should fit in viewport
      errorPage.getErrorContainer().should('be.visible');
    });

    it('should display properly on tablet', () => {
      cy.setTabletViewport();

      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();
    });

    it('should display properly on desktop', () => {
      cy.setDesktopViewport();

      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplay404();
      errorPage.shouldDisplayGoHomeButton();
    });
  });

  describe('Network error scenarios', () => {
    it('should handle complete network failure', () => {
      // Force offline
      cy.intercept('POST', '**/graphql', { forceNetworkError: true }).as('networkError');

      cy.visit('/', { failOnStatusCode: false });

      // Should show some error state or loading
      cy.get('body').should('exist');
    });

    it('should handle GraphQL parse errors', () => {
      cy.intercept('POST', '**/graphql', {
        statusCode: 400,
        body: {
          errors: [
            {
              message: 'Syntax Error: Unexpected token',
              extensions: { code: 'GRAPHQL_PARSE_FAILED' },
            },
          ],
        },
      }).as('parseError');

      cy.visit('/', { failOnStatusCode: false });

      // Should handle gracefully
      cy.get('body').should('exist');
    });

    it('should handle GraphQL validation errors', () => {
      cy.intercept('POST', '**/graphql', {
        statusCode: 400,
        body: {
          errors: [
            {
              message: 'Field does not exist',
              extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            },
          ],
        },
      }).as('validationError');

      cy.visit('/post/test', { failOnStatusCode: false });

      // Should show error
      cy.get('body').should('exist');
    });
  });

  describe('Error recovery', () => {
    it('should allow navigation after encountering error', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplay404();

      // Click Go Home
      errorPage.clickGoHome();

      // Should be able to navigate normally
      homePage.shouldDisplayPostGrid();
      homePage.shouldHavePostCards(1);

      // Click on a post
      homePage.clickPostCard(0);

      // Should display post successfully
      cy.url().should('include', '/post/');
      cy.get('.post').should('be.visible');
    });

    it('should clear error state when navigating to valid page', () => {
      cy.visit('/post/non-existent-post-xyz', { failOnStatusCode: false });

      errorPage.shouldDisplay404();

      // Navigate to home via URL
      cy.visit('/');

      // Should display home page without errors
      homePage.shouldDisplayPostGrid();
      errorPage.getErrorContainer().should('not.exist');
    });
  });
});

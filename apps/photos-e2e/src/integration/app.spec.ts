import { getGreeting } from '../support/app.po';

describe('blog', () => {
  beforeEach(() => {
    // Ignore hydration errors for e2e tests
    cy.on('uncaught:exception', (err) => {
      // Ignore React 18 hydration errors
      if (err.message.includes('Hydration') ||
          err.message.includes('hydrating') ||
          err.message.includes('Suspense')) {
        return false;
      }
      return true;
    });
    cy.visit('/');
  });

  it('should display home page', () => {
    // Check for site name in header
    cy.contains('mkaciuba.pl').should('be.visible')

    // Should have post grid
    cy.get('.max-w-screen-xl.mx-auto.grid').should('be.visible')

    // Should have at least one post
    cy.get('.max-w-screen-xl.mx-auto.grid > div').should('have.length.greaterThan', 0)
  });

  it('should open post', () => {
    cy.viewport(1600, 860)

    // Find and click first post title
    cy.get('.max-w-screen-xl.mx-auto.grid h1').first().click()

    // Should be on post page with content
    cy.url().should('include', '/post/')

    // Should have post content
    cy.get('.post').should('be.visible')
  })
});

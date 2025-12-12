// ***********************************************
// Custom commands for E2E testing
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    /**
     * Login to a private gallery with password
     * @param password - Gallery password
     * @param gallerySlug - Gallery slug
     * @param categorySlug - Category slug
     */
    login(password: string, gallerySlug: string, categorySlug: string): Chainable<void>;

    /**
     * Wait for a GraphQL operation to complete
     * @param operationName - The name of the GraphQL operation
     */
    waitForGraphQL(operationName: string): Chainable<void>;

    /**
     * Set viewport to mobile size
     */
    setMobileViewport(): Chainable<void>;

    /**
     * Set viewport to tablet size
     */
    setTabletViewport(): Chainable<void>;

    /**
     * Set viewport to desktop size
     */
    setDesktopViewport(): Chainable<void>;

    /**
     * Wait for PhotoSwipe to open
     */
    waitForPhotoSwipeOpen(): Chainable<void>;

    /**
     * Close PhotoSwipe viewer
     */
    closePhotoSwipe(): Chainable<void>;

    /**
     * Navigate to next image in PhotoSwipe
     */
    navigatePhotoSwipeNext(): Chainable<void>;

    /**
     * Navigate to previous image in PhotoSwipe
     */
    navigatePhotoSwipePrev(): Chainable<void>;

    /**
     * Scroll to trigger infinite load
     */
    scrollToTriggerInfiniteLoad(): Chainable<void>;
  }
}

// Login command - navigate to login page and authenticate
Cypress.Commands.add('login', (password: string, gallerySlug: string, categorySlug: string) => {
  cy.visit(`/gallery-login?gallery=${gallerySlug}&category=${categorySlug}`);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', `/gallery/${gallerySlug}/${categorySlug}`);
});

// Wait for GraphQL operation
Cypress.Commands.add('waitForGraphQL', (operationName: string) => {
  cy.intercept('POST', '**/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName;
    }
  });
  cy.wait(`@${operationName}`);
});

// Viewport helpers
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667);
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1920, 1080);
});

// PhotoSwipe helpers
Cypress.Commands.add('waitForPhotoSwipeOpen', () => {
  cy.get('.pswp').should('be.visible');
  cy.get('.pswp__img').should('be.visible');
});

Cypress.Commands.add('closePhotoSwipe', () => {
  cy.get('.pswp__button--close').click();
  cy.get('.pswp').should('not.be.visible');
});

Cypress.Commands.add('navigatePhotoSwipeNext', () => {
  cy.get('.pswp__button--arrow--right').click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300); // Wait for transition
});

Cypress.Commands.add('navigatePhotoSwipePrev', () => {
  cy.get('.pswp__button--arrow--left').click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300); // Wait for transition
});

// Infinite scroll helper
Cypress.Commands.add('scrollToTriggerInfiniteLoad', () => {
  cy.scrollTo('bottom');
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500); // Wait for sentinel to trigger
});

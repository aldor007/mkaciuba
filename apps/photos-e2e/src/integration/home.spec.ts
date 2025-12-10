import { homePage } from '../support/pages/home.po';

describe('Home Page', () => {
  describe('Basic loading', () => {
    it('should load home page successfully', () => {
      homePage.visit();

      // Verify page loaded
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Verify key elements are visible
      homePage.shouldDisplayNavbar();
      homePage.shouldDisplayFooter();
    });

    it('should display post grid', () => {
      homePage.visit();

      homePage.shouldDisplayPostGrid();
      homePage.shouldHavePostCards(1);
    });

    it('should display photos section', () => {
      homePage.visit();

      homePage.shouldDisplayPhotosSection();
    });

    it('should have page title', () => {
      homePage.visit();

      cy.title().should('not.be.empty');
    });

    it('should respond with 200 status', () => {
      cy.request('/').its('status').should('eq', 200);
    });
  });
});

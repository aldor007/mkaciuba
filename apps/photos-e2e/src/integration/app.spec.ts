import { getGreeting } from '../support/app.po';

describe('blog', () => {
  beforeEach(() => cy.visit('/'));

  it('should display home page', () => {
    // Should display site logo/name
    cy.contains('mkaciuba.pl').should('be.visible')

    // Should have post grid visible
    cy.get('.max-w-screen-xl.mx-auto.grid').should('be.visible')

    // Should have at least one post card
    cy.get('.max-w-screen-xl.mx-auto.grid .row a h1').should('have.length.greaterThan', 0)

    // Should have photos section with 9 photos
    cy.get('.w-full.sm\\:mx-auto.text-gray-700.bg-gray-100').within(() => {
      cy.get('.grid.grid-cols-3 a').should('have.length', 9)
    })
  });

  it('should open post', () => {
    cy.viewport(1600, 860)

    // Click on the first post title
    cy.get('.max-w-screen-xl.mx-auto.grid .row a[href^="/post/"] h1').first().click()

    // Should navigate to post page
    cy.url().should('include', '/post/')

    // Should display post content
    cy.get('.post').should('be.visible')
    cy.get('.post-text').should('be.visible').and('not.be.empty')
  })
});

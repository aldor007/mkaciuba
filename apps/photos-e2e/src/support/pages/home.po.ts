export class HomePage {
  visit() {
    cy.visit('/');
  }

  // Selectors
  getPostGrid() {
    return cy.get('.max-w-screen-xl.mx-auto.grid');
  }

  getPostCards() {
    return cy.get('.max-w-screen-xl.mx-auto.grid .row');
  }

  getPostCard(index: number) {
    return this.getPostCards().eq(index);
  }

  getPostTitle(index: number) {
    return this.getPostCard(index).find('h1');
  }

  getPostLink(index: number) {
    return this.getPostCard(index).find('a[href^="/post/"]');
  }

  getPhotosSection() {
    return cy.get('.w-full.sm\\:mx-auto.text-gray-700.bg-gray-100');
  }

  getPhotosThumbnails() {
    return this.getPhotosSection().find('.grid.grid-cols-3 a');
  }

  getLoadMoreButton() {
    return cy.contains('button', 'Więcej');
  }

  getNavbar() {
    return cy.get('nav');
  }

  getFooter() {
    return cy.get('footer');
  }

  // Actions
  clickPostCard(index: number) {
    this.getPostLink(index).first().click();
  }

  clickLoadMore() {
    this.getLoadMoreButton().click();
  }

  // Assertions
  shouldDisplayPostGrid() {
    this.getPostGrid().should('be.visible');
  }

  shouldHavePostCards(minCount = 1) {
    this.getPostCards().should('have.length.greaterThan', minCount - 1);
  }

  shouldDisplayPhotosSection() {
    this.getPhotosSection().should('be.visible');
  }

  shouldHavePhotosThumbnails(count = 9) {
    this.getPhotosThumbnails().should('have.length', count);
  }

  shouldDisplayNavbar() {
    this.getNavbar().should('be.visible');
  }

  shouldDisplayFooter() {
    this.getFooter().should('be.visible');
  }
}

export const homePage = new HomePage();

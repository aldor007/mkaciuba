export class PhotosPage {
  visit(gallerySlug: string, categorySlug: string) {
    cy.visit(`/gallery/${gallerySlug}/${categorySlug}`);
  }

  // Selectors
  getCategoryTitle() {
    return cy.get('h1.text-center').first();
  }

  getPhotoGrid() {
    return cy.get('.grid');
  }

  getPhotoThumbnails() {
    return this.getPhotoGrid().find('a');
  }

  getPhotoThumbnail(index: number) {
    return this.getPhotoThumbnails().eq(index);
  }

  getLoadMoreSentinel() {
    return cy.get('[data-testid="infinite-scroll-sentinel"]');
  }

  getLoadingIndicator() {
    return cy.get('[data-testid="loading-more"]');
  }

  getNavbar() {
    return cy.get('nav');
  }

  getFooter() {
    return cy.get('footer');
  }

  // PhotoSwipe selectors
  getPhotoSwipe() {
    return cy.get('.pswp');
  }

  getPhotoSwipeImage() {
    return cy.get('.pswp__img');
  }

  getPhotoSwipeNextButton() {
    return cy.get('.pswp__button--arrow--right');
  }

  getPhotoSwipePrevButton() {
    return cy.get('.pswp__button--arrow--left');
  }

  getPhotoSwipeCloseButton() {
    return cy.get('.pswp__button--close');
  }

  getPhotoSwipeCounter() {
    return cy.get('.pswp__counter');
  }

  // Actions
  clickPhotoThumbnail(index: number) {
    this.getPhotoThumbnail(index).click();
  }

  scrollToBottom() {
    cy.scrollTo('bottom');
  }

  // PhotoSwipe actions
  openPhotoSwipe(index = 0) {
    this.clickPhotoThumbnail(index);
  }

  closePhotoSwipe() {
    this.getPhotoSwipeCloseButton().click();
  }

  navigatePhotoSwipeNext() {
    this.getPhotoSwipeNextButton().click();
  }

  navigatePhotoSwipePrev() {
    this.getPhotoSwipePrevButton().click();
  }

  // Assertions
  shouldDisplayCategoryTitle(title?: string) {
    const titleEl = this.getCategoryTitle();
    titleEl.should('be.visible');
    if (title) {
      titleEl.should('contain', title);
    }
  }

  shouldDisplayPhotoGrid() {
    this.getPhotoGrid().should('be.visible');
  }

  shouldHavePhotoThumbnails(minCount = 1) {
    this.getPhotoThumbnails().should('have.length.greaterThan', minCount - 1);
  }

  shouldDisplayLoadingIndicator() {
    this.getLoadingIndicator().should('be.visible');
  }

  shouldNotDisplayLoadingIndicator() {
    this.getLoadingIndicator().should('not.exist');
  }

  // PhotoSwipe assertions
  shouldDisplayPhotoSwipe() {
    this.getPhotoSwipe().should('be.visible');
  }

  shouldNotDisplayPhotoSwipe() {
    this.getPhotoSwipe().should('not.be.visible');
  }

  shouldDisplayPhotoSwipeImage() {
    this.getPhotoSwipeImage().should('be.visible');
  }

  shouldShowPhotoSwipeCounter(current: number, total: number) {
    this.getPhotoSwipeCounter().should('contain', `${current} / ${total}`);
  }

  shouldBeOnPhotosPage(gallerySlug?: string, categorySlug?: string) {
    cy.url().should('include', '/gallery/');
    if (gallerySlug) {
      cy.url().should('include', gallerySlug);
    }
    if (categorySlug) {
      cy.url().should('include', categorySlug);
    }
  }
}

export const photosPage = new PhotosPage();

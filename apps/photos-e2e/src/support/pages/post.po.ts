export class PostPage {
  visit(slug: string) {
    cy.visit(`/post/${slug}`);
  }

  // Selectors
  getPostContainer() {
    return cy.get('.post');
  }

  getPostTitle() {
    return cy.get('.post h1').first();
  }

  getPostDate() {
    return cy.get('.post .text-sm.text-gray-500');
  }

  getPostCategory() {
    return cy.get('.post a[href^="/blog/category/"]');
  }

  getPostDescription() {
    return cy.get('.post .post-text p').first();
  }

  getPostContent() {
    return cy.get('.post-text');
  }

  getPostTags() {
    return cy.get('.post a[href^="/blog/tag/"]');
  }

  getGallery() {
    return cy.get('[data-testid="image-list"]').first();
  }

  getGalleryImages() {
    return this.getGallery().find('a');
  }

  getPrevPostArrow() {
    return cy.get('.post').find('a[href^="/post/"]').first();
  }

  getNextPostArrow() {
    return cy.get('.post').find('a[href^="/post/"]').last();
  }

  getRelatedPostsSection() {
    return cy.contains('h2', 'Powiązane posty').parent();
  }

  getRelatedPosts() {
    return this.getRelatedPostsSection().find('.row');
  }

  getNavbar() {
    return cy.get('nav');
  }

  getFooter() {
    return cy.get('footer');
  }

  // Actions
  clickCategory() {
    this.getPostCategory().click();
  }

  clickTag(index = 0) {
    this.getPostTags().eq(index).click();
  }

  clickPrevPost() {
    this.getPrevPostArrow().click();
  }

  clickNextPost() {
    this.getNextPostArrow().click();
  }

  clickRelatedPost(index: number) {
    this.getRelatedPosts().eq(index).find('a').first().click();
  }

  clickGalleryImage(index: number) {
    this.getGalleryImages().eq(index).click();
  }

  // Assertions
  shouldDisplayPost() {
    this.getPostContainer().should('be.visible');
  }

  shouldHaveTitle(title?: string) {
    const titleEl = this.getPostTitle();
    titleEl.should('be.visible');
    if (title) {
      titleEl.should('contain', title);
    }
  }

  shouldHaveContent() {
    this.getPostContent().should('be.visible').and('not.be.empty');
  }

  shouldHaveCategory() {
    this.getPostCategory().should('be.visible');
  }

  shouldHaveTags(minCount = 1) {
    this.getPostTags().should('have.length.greaterThan', minCount - 1);
  }

  shouldHaveGallery() {
    this.getGallery().should('be.visible');
  }

  shouldHaveGalleryImages(minCount = 1) {
    this.getGalleryImages().should('have.length.greaterThan', minCount - 1);
  }

  shouldHaveRelatedPosts(minCount = 1) {
    this.getRelatedPosts().should('have.length.greaterThan', minCount - 1);
  }

  shouldHavePrevPostArrow() {
    this.getPrevPostArrow().should('be.visible');
  }

  shouldHaveNextPostArrow() {
    this.getNextPostArrow().should('be.visible');
  }

  shouldBeOnPostPage(slug?: string) {
    cy.url().should('include', '/post/');
    if (slug) {
      cy.url().should('include', slug);
    }
  }
}

export const postPage = new PostPage();

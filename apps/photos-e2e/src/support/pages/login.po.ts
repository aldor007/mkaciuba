export class LoginPage {
  visit(gallerySlug?: string, categorySlug?: string) {
    let url = '/gallery-login';
    if (gallerySlug && categorySlug) {
      url += `?gallery=${gallerySlug}&category=${categorySlug}`;
    }
    cy.visit(url);
  }

  // Selectors
  getLoginForm() {
    return cy.get('form');
  }

  getPasswordInput() {
    return cy.get('input[type="password"]');
  }

  getSubmitButton() {
    return cy.get('button[type="submit"]');
  }

  getErrorMessage() {
    return cy.get('.text-red-500, .error-message');
  }

  getNavbar() {
    return cy.get('nav');
  }

  getFooter() {
    return cy.get('footer');
  }

  // Actions
  enterPassword(password: string) {
    this.getPasswordInput().clear().type(password);
  }

  submitForm() {
    this.getSubmitButton().click();
  }

  login(password: string) {
    this.enterPassword(password);
    this.submitForm();
  }

  // Assertions
  shouldDisplayLoginForm() {
    this.getLoginForm().should('be.visible');
  }

  shouldDisplayPasswordInput() {
    this.getPasswordInput().should('be.visible');
  }

  shouldDisplaySubmitButton() {
    this.getSubmitButton().should('be.visible').and('not.be.disabled');
  }

  shouldDisplayErrorMessage(message?: string) {
    const errorEl = this.getErrorMessage();
    errorEl.should('be.visible');
    if (message) {
      errorEl.should('contain', message);
    }
  }

  shouldBeOnLoginPage() {
    cy.url().should('include', '/gallery-login');
  }

  shouldRedirectToGallery(gallerySlug: string, categorySlug: string) {
    cy.url().should('include', `/gallery/${gallerySlug}/${categorySlug}`);
  }
}

export const loginPage = new LoginPage();

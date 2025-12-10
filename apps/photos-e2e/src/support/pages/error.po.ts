export class ErrorPage {
  // Selectors
  getErrorContainer() {
    return cy.get('.w-full.h-screen');
  }

  getErrorCode() {
    return cy.get('.text-6xl.font-bold');
  }

  getErrorTitle() {
    return cy.get('.text-2xl.font-semibold');
  }

  getErrorMessage() {
    return cy.get('.text-gray-600');
  }

  getErrorSuggestion() {
    return cy.get('.bg-blue-50');
  }

  getGoHomeButton() {
    return cy.contains('button', 'Go Home');
  }

  // Actions
  clickGoHome() {
    this.getGoHomeButton().click();
  }

  // Assertions
  shouldDisplayError() {
    this.getErrorContainer().should('be.visible');
  }

  shouldDisplayErrorCode(code: number) {
    this.getErrorCode().should('contain', code.toString());
  }

  shouldDisplayErrorTitle(title?: string) {
    const titleEl = this.getErrorTitle();
    titleEl.should('be.visible');
    if (title) {
      titleEl.should('contain', title);
    }
  }

  shouldDisplayErrorMessage(message?: string) {
    const messageEl = this.getErrorMessage();
    messageEl.should('be.visible');
    if (message) {
      messageEl.should('contain', message);
    }
  }

  shouldDisplayGoHomeButton() {
    this.getGoHomeButton().should('be.visible');
  }

  shouldDisplay404() {
    this.shouldDisplayErrorCode(404);
    this.shouldDisplayErrorTitle('Not Found');
  }

  shouldDisplay500() {
    this.shouldDisplayErrorCode(500);
    this.shouldDisplayErrorTitle('Internal Server Error');
  }
}

export const errorPage = new ErrorPage();

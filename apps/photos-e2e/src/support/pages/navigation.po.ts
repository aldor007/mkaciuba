export class NavigationPage {
  // Selectors - Desktop
  getNavbar() {
    return cy.get('nav');
  }

  getTopMenu() {
    return cy.get('nav .flex.justify-between').first();
  }

  getMainMenu() {
    return cy.get('nav ul.hidden.md\\:flex');
  }

  getMainMenuItem(text: string) {
    return this.getMainMenu().contains('li', text);
  }

  getDropdownMenu() {
    return cy.get('nav ul ul');
  }

  getDropdownMenuItem(text: string) {
    return this.getDropdownMenu().contains('li', text);
  }

  getBrandLogo() {
    return cy.get('nav a[href="/"]');
  }

  getSocialIcons() {
    return cy.get('nav .flex.items-center a[target="_blank"]');
  }

  // Selectors - Mobile
  getMobileMenuToggle() {
    return cy.get('nav button').contains('☰');
  }

  getMobileMenu() {
    return cy.get('nav .md\\:hidden ul');
  }

  getMobileMenuItem(text: string) {
    return this.getMobileMenu().contains('li', text);
  }

  // Actions - Desktop
  clickMainMenuItem(text: string) {
    this.getMainMenuItem(text).click();
  }

  hoverMainMenuItem(text: string) {
    this.getMainMenuItem(text).trigger('mouseover');
  }

  clickDropdownMenuItem(text: string) {
    this.getDropdownMenuItem(text).click();
  }

  clickBrandLogo() {
    this.getBrandLogo().click();
  }

  clickSocialIcon(index: number) {
    this.getSocialIcons().eq(index).click();
  }

  // Actions - Mobile
  openMobileMenu() {
    this.getMobileMenuToggle().click();
  }

  closeMobileMenu() {
    this.getMobileMenuToggle().click();
  }

  clickMobileMenuItem(text: string) {
    this.getMobileMenuItem(text).click();
  }

  // Assertions - Desktop
  shouldDisplayNavbar() {
    this.getNavbar().should('be.visible');
  }

  shouldDisplayMainMenu() {
    this.getMainMenu().should('be.visible');
  }

  shouldHaveMainMenuItem(text: string) {
    this.getMainMenuItem(text).should('be.visible');
  }

  shouldDisplayDropdownMenu() {
    this.getDropdownMenu().should('be.visible');
  }

  shouldHaveDropdownMenuItem(text: string) {
    this.getDropdownMenuItem(text).should('be.visible');
  }

  shouldDisplayBrandLogo() {
    this.getBrandLogo().should('be.visible');
  }

  shouldHaveSocialIcons(count: number) {
    this.getSocialIcons().should('have.length', count);
  }

  // Assertions - Mobile
  shouldDisplayMobileMenuToggle() {
    this.getMobileMenuToggle().should('be.visible');
  }

  shouldDisplayMobileMenu() {
    this.getMobileMenu().should('be.visible');
  }

  shouldNotDisplayMobileMenu() {
    this.getMobileMenu().should('not.be.visible');
  }

  shouldHaveMobileMenuItem(text: string) {
    this.getMobileMenuItem(text).should('be.visible');
  }
}

export const navigationPage = new NavigationPage();

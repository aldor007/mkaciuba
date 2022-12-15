import { getGreeting } from '../support/app.po';

describe('blog', () => {
  beforeEach(() => cy.visit('/'));

  it('should display home page', () => {
    // Custom command example, see `../support/commands.ts` file

    cy.get("#root > div.w-full.top-0.text-gray-600.bg-white > div > div > a > span").contains('mkaciuba.pl')
    // should have posts
    cy.get("#root > div.max-w-screen-xl.mx-auto.grid.xl\\:grid-cols-2.gap-4 > div:nth-child(1)").should('be.visible')

    // should have 9 photos
    cy.get("#root > div.w-full.sm\\:mx-auto.text-gray-700.bg-gray-100.mt-8.pt-8 > div > div:nth-child(3) > div").children().should('have.length', 9)
  });

  it('should open post', () => {
    cy.viewport(1600, 860)
    // open post
    cy.get("#root > div.max-w-screen-xl.mx-auto.grid.xl\\:grid-cols-2.gap-4 > div:nth-child(1) > div.absolute.text-lg.bg-gray.leading-snug.font-serif.top-1\\/3.sm\\:top-1\\/4.lg\\:top-1\\/2.z-10.h-16.min-w-full.justify-center.items-center.text-white > div > div:nth-child(1) > a > h1").click()
    // should have text
    cy.get("#root > div.w-full.h-full > div.post.w-full > div > div > div.max-w-screen-xl.mx-auto.post-text").contains(/[a-z]+/)
    // should see image caption
    cy.get("#root > div.w-full.h-full > div.post.w-full > div.post-content.w-full.max-w-screen-xl.mx-auto.-mt-12.relative > div > div.max-w-screen-xl.mx-auto.post-text > div.flex.flex-wrap.-mx-1.overflow-hidden > div:nth-child(1)").should('be.visible')
    // should click image caption
    cy.get("#root > div.w-full.h-full > div.post.w-full > div.post-content.w-full.max-w-screen-xl.mx-auto.-mt-12.relative > div > div.max-w-screen-xl.mx-auto.post-text > div.flex.flex-wrap.-mx-1.overflow-hidden > div:nth-child(1)").invoke('show').click()
    cy.scrollTo('bottom')
    // pwsp should have caption
    cy.get("div.pswp__caption").should('be.visible')
    // should close iamge
    cy.scrollTo('top')
    cy.get('button.pswp__button--close').invoke('show').click()
    // should have related posts
    cy.get("#root > div.w-full.h-full > div.post.w-full > div.post-content.w-full.max-w-screen-xl.mx-auto.-mt-12.relative > div > div.max-w-screen-xl.mx-auto.grid.xl\\:grid-cols-2.gap-4").children().should('have.length.greaterThan', 1)
  })
});

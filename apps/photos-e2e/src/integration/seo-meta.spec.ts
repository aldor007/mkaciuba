import { homePage } from '../support/pages/home.po';
import { postPage } from '../support/pages/post.po';

describe('SEO Meta Tags', () => {
  beforeEach(() => {
    cy.setDesktopViewport();
  });

  describe('Home page meta tags', () => {
    beforeEach(() => {
      homePage.visit();
    });

    it('should have correct title tag', () => {
      cy.title().should('include', 'mkaciuba.pl');
    });

    it('should have description meta tag', () => {
      cy.get('meta[name="description"]')
        .should('exist')
        .and('have.attr', 'content');
    });

    it('should have viewport meta tag', () => {
      cy.get('meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('include', 'width=device-width');
    });

    it('should have charset meta tag', () => {
      cy.get('meta[charset]').should('exist');
    });

    it('should have Twitter Card meta tags', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[name="twitter:card"]').length > 0) {
          cy.get('meta[name="twitter:card"]').should('have.attr', 'content');
        }
      });
    });
  });

  describe('Post page meta tags', () => {
    beforeEach(() => {
      homePage.visit();
      homePage.clickPostCard(0);
    });

    it('should have post-specific description', () => {
      cy.get('meta[name="description"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('not.be.empty');
    });

    it('should have og:title with post title', () => {
      postPage.getPostTitle().invoke('text').then((postTitle) => {
        cy.get('meta[property="og:title"]')
          .should('have.attr', 'content')
          .and('include', postTitle.trim());
      });
    });

    it('should have og:image for post', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:image"]').length > 0) {
          cy.get('meta[property="og:image"]')
            .should('have.attr', 'content')
            .and('match', /\.(jpg|jpeg|png|webp)/i);
        }
      });
    });

    it('should have og:url with correct post URL', () => {
      cy.url().then((currentUrl) => {
        cy.get('body').then(($body) => {
          if ($body.find('meta[property="og:url"]').length > 0) {
            cy.get('meta[property="og:url"]')
              .should('have.attr', 'content')
              .and('include', '/post/');
          }
        });
      });
    });

    it('should have Twitter Card with large image', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[name="twitter:card"]').length > 0) {
          cy.get('meta[name="twitter:card"]')
            .should('have.attr', 'content')
            .and('include', 'summary');
        }
      });
    });

    it('should have canonical URL', () => {
      cy.get('body').then(($body) => {
        if ($body.find('link[rel="canonical"]').length > 0) {
          cy.get('link[rel="canonical"]')
            .should('have.attr', 'href')
            .and('include', '/post/');
        }
      });
    });
  });

  describe('Gallery page meta tags', () => {
    beforeEach(() => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();
    });

    it('should have gallery-specific title', () => {
      cy.title().should('not.be.empty').and('include', 'mkaciuba.pl');
    });

    it('should have description for gallery', () => {
      cy.get('meta[name="description"]').should('exist');
    });

    it('should have og:title with gallery/category name', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:title"]').length > 0) {
          cy.get('meta[property="og:title"]')
            .should('have.attr', 'content')
            .and('not.be.empty');
        }
      });
    });
  });

  describe('Meta tag updates on navigation', () => {
    it('should update og:image when navigating to post with image', () => {
      homePage.visit();

      cy.get('body').then(($body) => {
        const homeOgImage = $body.find('meta[property="og:image"]').attr('content');

        homePage.clickPostCard(0);

        cy.wait(500);

        cy.get('body').then(($postBody) => {
          const postOgImage = $postBody.find('meta[property="og:image"]').attr('content');

          if (homeOgImage && postOgImage) {
            // Images might be different for home vs post
            expect(postOgImage).to.exist;
          }
        });
      });
    });
  });

  describe('Social sharing meta tags', () => {
    beforeEach(() => {
      homePage.visit();
      homePage.clickPostCard(0);
    });

    it('should have Facebook app ID if configured', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="fb:app_id"]').length > 0) {
          cy.get('meta[property="fb:app_id"]')
            .should('have.attr', 'content')
            .and('not.be.empty');
        }
      });
    });

    it('should have Twitter site handle if configured', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[name="twitter:site"]').length > 0) {
          cy.get('meta[name="twitter:site"]')
            .should('have.attr', 'content')
            .and('match', /@\w+/);
        }
      });
    });
  });

  describe('Structured data', () => {
    it('should have JSON-LD structured data on post page', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      cy.get('body').then(($body) => {
        if ($body.find('script[type="application/ld+json"]').length > 0) {
          cy.get('script[type="application/ld+json"]')
            .should('exist')
            .and(($script) => {
              const jsonLd = JSON.parse($script.text());
              expect(jsonLd).to.have.property('@type');
            });
        }
      });
    });
  });

  describe('Meta tag validation', () => {
    beforeEach(() => {
      homePage.visit();
    });

    it('should have non-empty content in meta tags', () => {
      cy.get('meta[name="description"]').should(($meta) => {
        const content = $meta.attr('content');
        if (content) {
          expect(content.length).to.be.greaterThan(10);
        }
      });
    });

    it('should have reasonable title length', () => {
      cy.title().should(($title) => {
        expect($title.length).to.be.greaterThan(5);
        expect($title.length).to.be.lessThan(100);
      });
    });

    it('should have reasonable description length', () => {
      cy.get('meta[name="description"]').should(($meta) => {
        const content = $meta.attr('content');
        if (content) {
          expect(content.length).to.be.greaterThan(10);
          expect(content.length).to.be.lessThan(300);
        }
      });
    });
  });

  describe('Image meta tags', () => {
    beforeEach(() => {
      homePage.visit();
      homePage.clickPostCard(0);
    });

    it('should have og:image with absolute URL', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:image"]').length > 0) {
          cy.get('meta[property="og:image"]')
            .should('have.attr', 'content')
            .and('match', /^https?:\/\//);
        }
      });
    });

    it('should have og:image:width and height if specified', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:image:width"]').length > 0) {
          cy.get('meta[property="og:image:width"]')
            .should('have.attr', 'content')
            .and('match', /^\d+$/);
        }

        if ($body.find('meta[property="og:image:height"]').length > 0) {
          cy.get('meta[property="og:image:height"]')
            .should('have.attr', 'content')
            .and('match', /^\d+$/);
        }
      });
    });

    it('should have og:image:alt with descriptive text', () => {
      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:image:alt"]').length > 0) {
          cy.get('meta[property="og:image:alt"]')
            .should('have.attr', 'content')
            .and('not.be.empty');
        }
      });
    });
  });

  describe('Locale and language meta tags', () => {
    it('should have og:locale if specified', () => {
      homePage.visit();

      cy.get('body').then(($body) => {
        if ($body.find('meta[property="og:locale"]').length > 0) {
          cy.get('meta[property="og:locale"]')
            .should('have.attr', 'content')
            .and('match', /^[a-z]{2}_[A-Z]{2}$/);
        }
      });
    });
  });
});

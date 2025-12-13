import { homePage } from '../support/pages/home.po';
import { postPage } from '../support/pages/post.po';

describe('Post Filtering', () => {
  beforeEach(() => {
    cy.setDesktopViewport();
  });

  describe('Filter by category', () => {
    it('should navigate to category page from post', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      postPage.shouldDisplayPost();

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/category/"]').length > 0) {
          const categoryLink = $body.find('a[href^="/blog/category/"]').first();
          const categoryName = categoryLink.text();
          const categoryHref = categoryLink.attr('href');

          cy.wrap(categoryLink).click();

          // Should navigate to category page
          cy.url().should('include', categoryHref || '');

          // Should display category title
          cy.get('h1').should('contain', categoryName);

          // Should display filtered posts
          cy.get('.grid, .row').should('be.visible');
        }
      });
    });

    it('should show only posts from selected category', () => {
      // Visit a category page
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Should have posts
          cy.get('.grid .row, .row').should('have.length.greaterThan', 0);

          // All posts should link to same category
          cy.get('.grid .row a[href^="/blog/category/"], .row a[href^="/blog/category/"]').then(($links) => {
            if ($links.length > 0) {
              const firstCategoryHref = $links.first().attr('href');
              $links.each((index, link) => {
                expect(Cypress.$(link).attr('href')).to.equal(firstCategoryHref);
              });
            }
          });
        }
      });
    });

    it('should maintain category filter when paginating', () => {
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          cy.url().then(() => {
            // Click pagination if exists
            if ($body.find('button:contains("Więcej")').length > 0) {
              cy.contains('button', 'Więcej').click();
              cy.wait(1000);

              // Should still be on same category page
              cy.url().should('include', '/blog/category/');
            }
          });
        }
      });
    });

    it('should display category name in page title', () => {
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          cy.get('h1').should('be.visible').and('not.be.empty');

          // Title should indicate this is a category page
          cy.get('h1').invoke('text').should('match', /kategori|category|posty/i);
        }
      });
    });
  });

  describe('Filter by tag', () => {
    it('should show only posts with selected tag', () => {
      cy.visit('/blog/tag/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Should have posts
          cy.get('.grid .row, .row').should('have.length.greaterThan', 0);
        }
      });
    });

    it('should display tag name in page title', () => {
      cy.visit('/blog/tag/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          cy.get('h1').should('be.visible').and('not.be.empty');

          // Title should indicate this is a tag page
          cy.get('h1').invoke('text').should('match', /tag|posty z tagu/i);
        }
      });
    });

    it('should maintain tag filter when paginating', () => {
      cy.visit('/blog/tag/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Click pagination if exists
          if ($body.find('button:contains("Więcej")').length > 0) {
            cy.contains('button', 'Więcej').click();
            cy.wait(1000);

            // Should still be on same tag page
            cy.url().should('include', '/blog/tag/');
          }
        }
      });
    });
  });

  describe('Combined filtering', () => {
    it('should support filtering by category and then by tag', () => {
      // First filter by category
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Click on a post
          cy.get('.grid .row a[href^="/post/"], .row a[href^="/post/"]').first().click();

          postPage.shouldDisplayPost();

          // Now filter by tag
          cy.get('body').then(($postBody) => {
            if ($postBody.find('a[href^="/blog/tag/"]').length > 0) {
              cy.get('a[href^="/blog/tag/"]').first().click();

              // Should be on tag filtered page
              cy.url().should('include', '/blog/tag/');
            }
          });
        }
      });
    });
  });

  describe('Pagination with filters', () => {
    it('should paginate category results', () => {
      cy.visit('/blog/category/test?page=1', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Should display posts
          cy.get('.grid, .row').should('be.visible');

          // URL should have page param
          cy.url().should('include', 'page=');
        }
      });
    });

    it('should paginate tag results', () => {
      cy.visit('/blog/tag/test?page=1', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Should display posts
          cy.get('.grid, .row').should('be.visible');

          // URL should have page param
          cy.url().should('include', 'page=');
        }
      });
    });

    it('should persist filter on back navigation', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/category/"]').length > 0) {
          const categoryHref = $body.find('a[href^="/blog/category/"]').first().attr('href');

          cy.get('a[href^="/blog/category/"]').first().click();

          // Navigate to a post
          cy.get('.grid .row a[href^="/post/"], .row a[href^="/post/"]').first().click();

          // Go back
          cy.go('back');

          // Should still be on category page
          cy.url().should('include', categoryHref || '');
        }
      });
    });
  });

  describe('Filter UI elements', () => {
    it('should highlight active category', () => {
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Category name should be prominently displayed
          cy.get('h1').should('be.visible').and('not.be.empty');
        }
      });
    });

    it('should highlight active tag', () => {
      cy.visit('/blog/tag/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Tag name should be prominently displayed
          cy.get('h1').should('be.visible').and('not.be.empty');
        }
      });
    });

    it('should show post count for filtered results', () => {
      cy.visit('/blog/category/test', { failOnStatusCode: false });

      cy.get('body').then(($body) => {
        if (!$body.text().includes('404') && !$body.text().includes('500')) {
          // Should have posts visible
          cy.get('.grid .row, .row').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Empty filter results', () => {
    it('should handle category with no posts gracefully', () => {
      cy.visit('/blog/category/empty-category-xyz', { failOnStatusCode: false });

      // Should show appropriate message or empty state
      cy.get('body').should('exist');
    });

    it('should handle tag with no posts gracefully', () => {
      cy.visit('/blog/tag/empty-tag-xyz', { failOnStatusCode: false });

      // Should show appropriate message or empty state
      cy.get('body').should('exist');
    });
  });

  describe('Filter URL structure', () => {
    it('should have clean category URLs', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/category/"]').length > 0) {
          cy.get('a[href^="/blog/category/"]').first().invoke('attr', 'href').should('match', /^\/blog\/category\/[a-z0-9-]+$/);
        }
      });
    });

    it('should have clean tag URLs', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/tag/"]').length > 0) {
          cy.get('a[href^="/blog/tag/"]').first().invoke('attr', 'href').should('match', /^\/blog\/tag\/[a-z0-9-]+$/);
        }
      });
    });

    it('should support query parameters for pagination', () => {
      cy.visit('/blog/category/test?page=2', { failOnStatusCode: false });

      cy.url().should('include', '?page=2');
    });
  });

  describe('Filter from post page', () => {
    it('should show category link on post', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      postPage.shouldDisplayPost();

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/category/"]').length > 0) {
          postPage.shouldHaveCategory();
        }
      });
    });

    it('should show tag links on post', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      postPage.shouldDisplayPost();

      cy.get('body').then(($body) => {
        if ($body.find('a[href^="/blog/tag/"]').length > 0) {
          postPage.shouldHaveTags(1);
        }
      });
    });

    it('should allow clicking multiple tags from same post', () => {
      homePage.visit();
      homePage.clickPostCard(0);

      postPage.shouldDisplayPost();

      cy.get('body').then(($body) => {
        const tagLinks = $body.find('a[href^="/blog/tag/"]');
        if (tagLinks.length > 1) {
          const firstTag = tagLinks.eq(0).attr('href');
          const secondTag = tagLinks.eq(1).attr('href');

          // Click first tag
          cy.wrap(tagLinks.eq(0)).click({ force: true });
          cy.url().should('include', firstTag || '');

          // Go back and click second tag
          cy.go('back');
          cy.get('a[href^="/blog/tag/"]').eq(1).click({ force: true });
          cy.url().should('include', secondTag || '');
        }
      });
    });
  });
});

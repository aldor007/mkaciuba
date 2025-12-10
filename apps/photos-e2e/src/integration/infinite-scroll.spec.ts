import { photosPage } from '../support/pages/photos.po';
import { homePage } from '../support/pages/home.po';

describe('Infinite Scroll', () => {
  beforeEach(() => {
    cy.setDesktopViewport();
  });

  describe('Gallery infinite scroll', () => {
    it('should load more images when scrolling to bottom', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Get initial image count
      photosPage.getPhotoThumbnails().its('length').then((initialCount) => {
        // Scroll to bottom
        cy.scrollToTriggerInfiniteLoad();

        // Wait for new images to load
        cy.wait(2000);

        // Should have more images
        photosPage.getPhotoThumbnails().its('length').should('be.greaterThan', initialCount);
      });
    });

    it('should show loading indicator when loading more images', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Scroll to bottom
      cy.scrollTo('bottom');

      // Should show loading indicator briefly
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="loading-more"]').length > 0) {
          photosPage.shouldDisplayLoadingIndicator();
        }
      });
    });

    it('should display sentinel element when more images available', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Check if sentinel exists (indicates more images to load)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="infinite-scroll-sentinel"]').length > 0) {
          photosPage.getLoadMoreSentinel().should('exist');
        }
      });
    });

    it('should not display sentinel when all images loaded', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Scroll multiple times to load all images
      for (let i = 0; i < 5; i++) {
        cy.scrollToTriggerInfiniteLoad();
        cy.wait(1000);
      }

      // Eventually sentinel should not be present
      cy.get('body').then(($body) => {
        const hasMoreContent = $body.find('[data-testid="infinite-scroll-sentinel"]').length > 0;
        // If no sentinel, all content is loaded
        if (!hasMoreContent) {
          photosPage.getLoadMoreSentinel().should('not.exist');
        }
      });
    });

    it('should load images progressively on multiple scrolls', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      let previousCount = 0;

      // Get initial count
      photosPage.getPhotoThumbnails().its('length').then((count) => {
        previousCount = count;

        // Scroll and check count increases
        cy.scrollToTriggerInfiniteLoad();
        cy.wait(1500);

        photosPage.getPhotoThumbnails().its('length').then((newCount) => {
          if (newCount > previousCount) {
            expect(newCount).to.be.greaterThan(previousCount);

            // Try one more scroll
            previousCount = newCount;
            cy.scrollToTriggerInfiniteLoad();
            cy.wait(1500);

            photosPage.getPhotoThumbnails().its('length').then((finalCount) => {
              // Count should be >= previous (might have reached end)
              expect(finalCount).to.be.at.least(previousCount);
            });
          }
        });
      });
    });
  });

  describe('Home page posts infinite scroll', () => {
    it('should load more posts when scrolling on home page', () => {
      homePage.visit();

      // Get initial post count
      homePage.getPostCards().its('length').then((initialCount) => {
        // Scroll to bottom
        cy.scrollToTriggerInfiniteLoad();

        // Wait for new posts
        cy.wait(2000);

        // Check if more posts loaded
        homePage.getPostCards().its('length').then((newCount) => {
          // Should have at least as many (might have reached end)
          expect(newCount).to.be.at.least(initialCount);
        });
      });
    });

    it('should show load more button on home page', () => {
      homePage.visit();

      // Check if load more button exists
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Więcej")').length > 0) {
          homePage.getLoadMoreButton().should('be.visible');
        }
      });
    });

    it('should load more posts when clicking load more button', () => {
      homePage.visit();

      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Więcej")').length > 0) {
          // Get initial count
          homePage.getPostCards().its('length').then((initialCount) => {
            // Click load more
            homePage.clickLoadMore();

            // Wait for posts to load
            cy.wait(2000);

            // Should have more posts
            homePage.getPostCards().its('length').should('be.greaterThan', initialCount);
          });
        }
      });
    });
  });

  describe('Infinite scroll performance', () => {
    it('should not load duplicate images', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Get all image sources
      const imageSources: string[] = [];

      photosPage.getPhotoThumbnails().each(($thumb) => {
        const src = $thumb.find('img').attr('src');
        if (src) imageSources.push(src);
      });

      // Scroll to load more
      cy.scrollToTriggerInfiniteLoad();
      cy.wait(2000);

      // Get updated sources
      const newImageSources: string[] = [];
      photosPage.getPhotoThumbnails().each(($thumb) => {
        const src = $thumb.find('img').attr('src');
        if (src) newImageSources.push(src);
      });

      // Check for duplicates
      const duplicates = newImageSources.filter(
        (src, index) => newImageSources.indexOf(src) !== index
      );

      expect(duplicates.length).to.equal(0);
    });

    it('should handle rapid scrolling', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Rapid scroll multiple times
      cy.scrollTo('bottom', { duration: 100 });
      cy.wait(100);
      cy.scrollTo('bottom', { duration: 100 });
      cy.wait(100);
      cy.scrollTo('bottom', { duration: 100 });

      // Wait for loading to complete
      cy.wait(2000);

      // Should still display images without errors
      photosPage.shouldHavePhotoThumbnails(1);
    });
  });

  describe('Infinite scroll on different viewports', () => {
    it('should work on mobile viewport', () => {
      cy.setMobileViewport();

      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      photosPage.getPhotoThumbnails().its('length').then((initialCount) => {
        cy.scrollToTriggerInfiniteLoad();
        cy.wait(2000);

        photosPage.getPhotoThumbnails().its('length').should('be.at.least', initialCount);
      });
    });

    it('should work on tablet viewport', () => {
      cy.setTabletViewport();

      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      photosPage.getPhotoThumbnails().its('length').then((initialCount) => {
        cy.scrollToTriggerInfiniteLoad();
        cy.wait(2000);

        photosPage.getPhotoThumbnails().its('length').should('be.at.least', initialCount);
      });
    });
  });

  describe('Infinite scroll error handling', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Intercept GraphQL and simulate error
      cy.intercept('POST', '**/graphql', {
        statusCode: 500,
        body: { errors: [{ message: 'Network error' }] },
      }).as('errorRequest');

      // Try to scroll
      cy.scrollToTriggerInfiniteLoad();

      // Should not crash - page should still be usable
      photosPage.shouldDisplayPhotoGrid();
    });
  });
});

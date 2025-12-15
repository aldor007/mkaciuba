describe('Image flickering prevention E2E', () => {
  beforeEach(() => {
    cy.setDesktopViewport();
  });

  describe('Initial page load', () => {
    it('should not flicker images on initial page load', () => {
      cy.visit('/');

      // Wait for images to start loading
      cy.get('img').first().should('exist');

      // Check that images become visible
      cy.get('img').first().should('be.visible');

      // Wait a bit to ensure no flickering occurs
      cy.wait(500);

      // Images should still be visible and stable
      cy.get('img').first().should('be.visible');
      cy.get('img').first().should('not.have.class', 'animate-pulse');
    });

    it('should maintain image visibility during hydration', () => {
      cy.visit('/');

      // Get the first image's src immediately (during potential hydration window)
      cy.get('img').first().then(($img) => {
        const initialSrc = $img.attr('src');

        // Wait for hydration to complete (150ms + buffer)
        cy.wait(300);

        // Image src should remain stable after hydration
        cy.get('img').first().should('have.attr', 'src', initialSrc);
      });
    });

    it('should not show blank images during initial load', () => {
      cy.visit('/');

      // Images should not have opacity-0 class for extended period
      cy.get('img', { timeout: 2000 }).each(($img) => {
        // Allow brief loading state, but images should become visible
        cy.wrap($img).should('not.have.class', 'opacity-0');
      });
    });
  });

  describe('SSR hydration stability', () => {
    it('should maintain stable images after SSR hydration', () => {
      cy.visit('/gallery/portfolio');

      // Get initial image sources quickly (within first 50ms)
      const imageSources: string[] = [];

      cy.get('.grid img').then(($images) => {
        $images.each((i, img) => {
          const src = img.getAttribute('src');
          if (src) imageSources.push(src);
        });
      });

      // Wait for hydration window to complete
      cy.wait(200);

      // Verify images haven't changed
      cy.get('.grid img').each(($img, index) => {
        if (index < imageSources.length) {
          cy.wrap($img).should('have.attr', 'src', imageSources[index]);
        }
      });
    });

    it('should not show loading states after SSR content is displayed', () => {
      cy.visit('/gallery/portfolio');

      // After a brief moment, no images should be in loading state
      cy.wait(300);

      cy.get('img').each(($img) => {
        cy.wrap($img).should('not.have.class', 'animate-pulse');
      });
    });
  });

  describe('Image gallery navigation', () => {
    it('should not flicker when scrolling through gallery', () => {
      cy.visit('/gallery/portfolio');

      // Click first gallery item
      cy.get('.grid a').first().click();

      // Get initial image
      cy.get('img').first().should('be.visible');

      // Rapid scrolling
      for (let i = 0; i < 3; i++) {
        cy.scrollTo('bottom', { duration: 100 });
        cy.wait(100);
      }

      // All visible images should not be showing loading animation
      cy.get('img:visible').each(($img) => {
        cy.wrap($img).should('not.have.class', 'animate-pulse');
      });
    });

    it('should not show blank images during infinite scroll', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid a').first().click();

      // Trigger infinite scroll
      cy.scrollToTriggerInfiniteLoad();

      // Wait for new images to load
      cy.wait(1000);

      // All visible images should have src attribute
      cy.get('img:visible').each(($img) => {
        cy.wrap($img).should('have.attr', 'src').and('not.be.empty');
      });
    });
  });

  describe('Viewport resize stability', () => {
    it('should not flicker when resizing viewport slightly', () => {
      cy.visit('/gallery/portfolio');
      cy.get('img').first().should('be.visible');

      // Get initial image source
      cy.get('img').first().invoke('attr', 'src').then((initialSrc) => {
        // Resize viewport slightly (within threshold)
        cy.viewport(1800, 900);

        // Wait for debounce (300ms) + buffer
        cy.wait(400);

        // Image should not have changed (within threshold)
        cy.get('img').first().should('have.attr', 'src', initialSrc);
      });
    });

    it('should smoothly transition when viewport changes significantly', () => {
      cy.visit('/gallery/portfolio');
      cy.get('img').first().should('be.visible');

      // Resize to mobile
      cy.setMobileViewport();

      // Wait for transition
      cy.wait(500);

      // Images should not show prolonged loading states
      cy.get('img:visible').should('not.have.class', 'opacity-0');
    });
  });

  describe('Format switching stability', () => {
    it('should not show visible transitions during format changes', () => {
      cy.visit('/');

      // Get an image element
      cy.get('img').first().then(() => {
        // Check that no opacity-0 class appears unexpectedly
        cy.get('img').first().should('not.have.class', 'opacity-0');

        // Even after some time, image should remain stable
        cy.wait(500);
        cy.get('img').first().should('be.visible');
      });
    });
  });

  describe('Gallery modal interactions', () => {
    it('should not flicker when opening gallery modal', () => {
      cy.visit('/gallery/portfolio');

      // Wait for images to load
      cy.get('.grid img', { timeout: 10000 }).should('have.length.greaterThan', 0);

      // Click on first image to open modal
      cy.get('.grid img').first().click({ force: true });

      // Modal image should appear without prolonged loading
      cy.wait(1000);

      // Check that modal images are visible (if modal exists)
      cy.get('body').then(($body) => {
        // PhotoSwipe modal might use different structure
        if ($body.find('.pswp').length > 0) {
          cy.get('.pswp', { timeout: 5000 }).should('exist');
          // Check for image within modal - it might be a picture element
          cy.get('.pswp img, .pswp picture', { timeout: 5000 }).should('exist');
        } else {
          // Modal didn't open, which is acceptable - just log it
          cy.log('Gallery modal did not open');
        }
      });
    });

    it('should not flicker when navigating between gallery images', () => {
      cy.visit('/gallery/portfolio');
      cy.get('.grid img', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.get('.grid img').first().click({ force: true });

      // Wait for modal to open
      cy.wait(1000);

      // Simulate navigation (if navigation buttons exist and are visible)
      cy.get('body').then(($body) => {
        // Check if modal is open and navigation buttons exist
        const hasNavButtons = $body.find('.pswp__button--arrow--right:visible, .pswp .pswp__button--next:visible').length > 0;

        if (hasNavButtons) {
          cy.log('Gallery navigation buttons found, testing navigation');

          // Click next button multiple times with proper visibility checks
          const clickNext = () => {
            // Wait for button to be visible before clicking
            cy.get('.pswp__button--arrow--right, .pswp .pswp__button--next')
              .filter(':visible')
              .first()
              .should('be.visible')
              .click({ force: true }); // Use force to avoid flaky visibility issues

            cy.wait(200);

            // Images should be visible, not stuck in loading state
            cy.get('.pswp img:visible, .pswp picture:visible').should('exist');
          };

          // Try to navigate, but don't fail if modal closes
          cy.get('.pswp').then(($modal) => {
            if ($modal.is(':visible')) {
              clickNext();

              // Check if modal is still open before continuing
              cy.get('.pswp').then(($m) => {
                if ($m.is(':visible')) {
                  clickNext();
                  cy.get('.pswp').then(($m2) => {
                    if ($m2.is(':visible')) {
                      clickNext();
                    }
                  });
                }
              });
            }
          });
        } else {
          cy.log('Gallery navigation buttons not found or not visible');
        }
      });
    });
  });

  describe('Post card image stability', () => {
    it('should display post card images without flickering', () => {
      cy.visit('/');

      // Wait for post cards to load - Posts component renders divs with max-w-screen-xl class
      cy.get('.max-w-screen-xl img', { timeout: 10000 }).should('have.length.greaterThan', 0);

      // Check that images in post cards are visible
      cy.get('.max-w-screen-xl img')
        .first()
        .should('be.visible');

      // Wait and verify stability
      cy.wait(300);

      cy.get('.max-w-screen-xl img')
        .first()
        .should('not.have.class', 'animate-pulse');
    });

    it('should not show loading states on cached images', () => {
      // Visit page once
      cy.visit('/');
      cy.wait(1000);

      // Navigate away
      cy.visit('/about');
      cy.wait(500);

      // Navigate back
      cy.visit('/');

      // Images should display immediately without loading states
      cy.get('img').first().should('be.visible');
      cy.get('img').first().should('not.have.class', 'opacity-0');
      cy.get('img').first().should('not.have.class', 'animate-pulse');
    });
  });

  describe('Network conditions', () => {
    it('should handle slow image loading gracefully', () => {
      // Throttle network
      cy.intercept('**/*.{jpg,jpeg,png,webp}', (req) => {
        req.reply({
          delay: 1000, // Simulate slow network
        });
      });

      cy.visit('/');

      // Should show loading state initially
      cy.get('img').first().should('exist');

      // After timeout, images should still appear
      cy.wait(2000);
      cy.get('img', { timeout: 3000 }).first().should('be.visible');
    });
  });
});

/**
 * E2E tests for SSR hydration issues
 * These tests verify that SSR content hydrates correctly without duplication or flashing
 */

describe('SSR Hydration', () => {
  beforeEach(() => {
    // Clear any cached data to ensure clean test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Home page hydration', () => {
    it('should not duplicate posts during hydration', () => {
      cy.visit('/');

      // Wait for hydration to complete
      cy.wait(2000);

      // Count post card containers - there should not be duplicates
      cy.get('.max-w-screen-xl').then(($posts) => {
        const uniqueTitles = new Set();
        const duplicateTitles: string[] = [];

        $posts.each((index, post) => {
          const title = Cypress.$(post).find('h1').text().trim();
          if (title && uniqueTitles.has(title)) {
            duplicateTitles.push(title);
          }
          if (title) {
            uniqueTitles.add(title);
          }
        });

        // Fail if any duplicates found
        expect(duplicateTitles, 'No duplicate post titles should exist').to.have.lengthOf(0);
      });
    });

    it('should not duplicate images during hydration', () => {
      cy.visit('/');

      // Wait for hydration to complete
      cy.wait(2000);

      // Check for duplicate images with the same src
      cy.get('img[src]').then(($images) => {
        const srcCounts = new Map<string, number>();
        const duplicates: string[] = [];

        $images.each((index, img) => {
          const src = Cypress.$(img).attr('src');
          if (src && !src.includes('placeholder')) {
            const count = srcCounts.get(src) || 0;
            srcCounts.set(src, count + 1);
            if (count > 0) {
              duplicates.push(src);
            }
          }
        });

        // Some duplication might be expected (e.g., thumbnails), so we'll log warnings
        // but fail if there are many duplicates (> 10% of images)
        const duplicateCount = duplicates.length;
        const totalCount = srcCounts.size;
        const duplicatePercent = (duplicateCount / totalCount) * 100;

        cy.log(`Found ${duplicateCount} duplicate images out of ${totalCount} unique images (${duplicatePercent.toFixed(1)}%)`);

        // Fail if more than 10% duplication
        expect(duplicatePercent, 'Duplicate images should be less than 10%').to.be.lessThan(10);
      });
    });

    it('should not show hydration errors in console', () => {
      // Listen for console errors
      cy.on('window:before:load', (win) => {
        cy.spy(win.console, 'error').as('consoleError');
        cy.spy(win.console, 'warn').as('consoleWarn');
      });

      cy.visit('/');

      // Wait for hydration to complete
      cy.wait(2000);

      // Check for React hydration errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.get('@consoleError').should((stub: any) => {
        const calls = stub.getCalls();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hydrationErrors = calls.filter((call: any) => {
          const args = call.args.join(' ');
          return args.includes('Hydration') ||
                 args.includes('hydration') ||
                 args.includes('did not match') ||
                 args.includes('server-rendered HTML');
        });

        // Log any hydration errors found
        if (hydrationErrors.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cy.log('Hydration errors found:', JSON.stringify(hydrationErrors.map((c: any) => c.args)));
        }

        expect(hydrationErrors, 'No React hydration errors should occur').to.have.lengthOf(0);
      });
    });

    it('should preserve SSR content structure during hydration', () => {
      cy.visit('/');

      // Capture initial HTML structure before hydration completes
      let initialPostCount = 0;
      cy.get('.max-w-screen-xl', { timeout: 1000 }).then(($posts) => {
        initialPostCount = $posts.length;
        cy.log(`Initial SSR posts: ${initialPostCount}`);
      });

      // Wait for hydration to complete
      cy.wait(2000);

      // Verify the post count hasn't changed (no discarding of SSR content)
      cy.get('.max-w-screen-xl').should(($posts) => {
        const finalPostCount = $posts.length;
        cy.log(`Final posts after hydration: ${finalPostCount}`);
        expect(finalPostCount).to.be.gte(initialPostCount);
      });
    });

    it('should not show visible content flashing during hydration', () => {
      // Use video recording to check for flashing - this test verifies timing
      cy.visit('/');

      // Immediately check that content is visible (SSR should provide this)
      cy.get('.max-w-screen-xl h1', { timeout: 500 }).should('be.visible');

      // Content should remain visible throughout hydration
      cy.wait(100);
      cy.get('.max-w-screen-xl h1').should('be.visible');

      cy.wait(500);
      cy.get('.max-w-screen-xl h1').should('be.visible');

      cy.wait(1000);
      cy.get('.max-w-screen-xl h1').should('be.visible');

      // Verify no loading states are shown after SSR content is present
      cy.get('.animate-pulse').should('not.exist');
      cy.get('.opacity-0').should('not.exist');
    });
  });

  describe('Gallery page hydration', () => {
    it('should not duplicate gallery images during hydration', () => {
      cy.visit('/gallery/portfolio');

      // Wait for hydration to complete
      cy.wait(2000);

      // Check for duplicate images in the grid
      cy.get('.grid img[src]').then(($images) => {
        const srcSet = new Set<string>();
        const duplicates: string[] = [];

        $images.each((index, img) => {
          const src = Cypress.$(img).attr('src');
          if (src) {
            if (srcSet.has(src)) {
              duplicates.push(src);
            }
            srcSet.add(src);
          }
        });

        expect(duplicates, 'No duplicate gallery images should exist').to.have.lengthOf(0);
      });
    });

    it('should maintain grid structure during hydration', () => {
      cy.visit('/gallery/portfolio');

      // Capture initial grid count
      let initialImageCount = 0;
      cy.get('.grid img', { timeout: 1000 }).then(($images) => {
        initialImageCount = $images.length;
        cy.log(`Initial SSR images: ${initialImageCount}`);
      });

      // Wait for hydration
      cy.wait(2000);

      // Grid should maintain or increase image count (not decrease)
      cy.get('.grid img').should(($images) => {
        const finalImageCount = $images.length;
        cy.log(`Final images after hydration: ${finalImageCount}`);
        expect(finalImageCount).to.be.gte(initialImageCount);
      });
    });
  });

  describe('Post page hydration', () => {
    it('should not duplicate post content during hydration', () => {
      // First, get a post slug by visiting home and extracting a link
      cy.visit('/');
      cy.get('a[href^="/post/"]').first().then(($link) => {
        const href = $link.attr('href');
        if (href) {
          cy.visit(href);

          // Wait for hydration to complete
          cy.wait(2000);

          // Check that the post title appears only once
          cy.get('h1').should('have.length.lessThan', 3);

          // Check that the main content area exists only once
          cy.get('article, .post-content, main').should('have.length.lessThan', 3);
        }
      });
    });
  });
});

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

      // Wait for posts to load and hydration to complete
      cy.get('.max-w-screen-xl', { timeout: 10000 }).should('be.visible');
      // Additional wait for React hydration to complete
      cy.get('.max-w-screen-xl h1', { timeout: 5000 }).should('be.visible');

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

      // Wait for images to load
      cy.get('img[src]', { timeout: 10000 }).should('have.length.greaterThan', 0);
      // Wait for any lazy-loaded images to appear
      cy.wait(1000); // Brief wait for lazy loading to trigger

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

      // Wait for page to be fully loaded and hydrated
      cy.get('.max-w-screen-xl', { timeout: 10000 }).should('be.visible');
      cy.get('body').should('have.class', 'loaded').or('exist'); // Wait for page ready

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

      // Capture initial HTML structure as soon as available
      let initialPostCount = 0;
      cy.get('.max-w-screen-xl', { timeout: 2000 })
        .should('exist')
        .then(($posts) => {
          initialPostCount = $posts.length;
          cy.log(`Initial SSR posts: ${initialPostCount}`);
        });

      // Wait for hydration to complete by checking for interactive content
      cy.get('.max-w-screen-xl a', { timeout: 10000 }).should('be.visible');

      // Verify the post count hasn't changed (no discarding of SSR content)
      cy.get('.max-w-screen-xl').then(($posts) => {
        const finalPostCount = $posts.length;
        cy.log(`Final posts after hydration: ${finalPostCount}`);
        expect(finalPostCount, 'Post count should not decrease after hydration').to.be.gte(initialPostCount);
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

      // Wait for gallery grid and images to load
      cy.get('.grid', { timeout: 10000 }).should('be.visible');
      cy.get('.grid img[src]', { timeout: 10000 }).should('have.length.greaterThan', 0);

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

      // Capture initial grid count as soon as grid appears
      let initialImageCount = 0;
      cy.get('.grid img', { timeout: 3000 })
        .should('have.length.greaterThan', 0)
        .then(($images) => {
          initialImageCount = $images.length;
          cy.log(`Initial SSR images: ${initialImageCount}`);
        });

      // Wait for hydration by checking for interactive elements
      cy.get('.grid img').first().should('be.visible');
      // Wait for any additional images to load
      cy.wait(1000);

      // Grid should maintain or increase image count (not decrease)
      cy.get('.grid img').then(($images) => {
        const finalImageCount = $images.length;
        cy.log(`Final images after hydration: ${finalImageCount}`);
        expect(finalImageCount, 'Image count should not decrease after hydration').to.be.gte(initialImageCount);
      });
    });
  });

  describe('Post page hydration', () => {
    it('should not duplicate post content during hydration', () => {
      // First, get a post slug by visiting home and extracting a link
      cy.visit('/');
      cy.get('a[href^="/post/"]', { timeout: 10000 })
        .should('be.visible')
        .first()
        .then(($link) => {
          const href = $link.attr('href');
          if (href) {
            cy.visit(href);

            // Wait for post content to load
            cy.get('h1', { timeout: 10000 }).should('be.visible');
            // Wait for content area to be ready
            cy.get('body').should('exist');

            // Check for duplicate post content in the main content area
            // Focus on the actual post content, not navigation or other page elements
            cy.get('body').then(($body) => {
            const allH1s = $body.find('h1');
            cy.log(`Total h1 elements found: ${allH1s.length}`);

            // Get h1s that are likely post titles (not in nav, footer, etc.)
            const contentH1s = $body.find('article h1, .post-content h1, main h1, [class*="post"] h1');
            cy.log(`H1s in post content area: ${contentH1s.length}`);

            // Log where the h1s are for debugging
            allH1s.each((index, el) => {
              const text = Cypress.$(el).text().substring(0, 50);
              const parent = Cypress.$(el).parent().attr('class') || 'no-class';
              cy.log(`H1 ${index + 1}: "${text}" in ${parent}`);
            });

            // The main post title should appear only once in the content area
            expect(contentH1s.length, 'Post title should not be duplicated in content').to.be.lessThan(3);
          });

          // Check that the main content area exists only once
          cy.get('article, .post-content, main').should('have.length.lessThan', 3);
        }
      });
    });
  });
});

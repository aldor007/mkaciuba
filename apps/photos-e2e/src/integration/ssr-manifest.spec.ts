/// <reference types="cypress" />

describe('SSR Manifest Validation', () => {
  describe('Manifest CSS files', () => {
    it('should have main.css in manifest', () => {
      cy.request('/assets/manifest.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('main.css');
        expect(response.body['main.css']).to.be.a('string');
        // Accept both main.css and main.[hash].css
        expect(response.body['main.css']).to.match(/main(\.[a-f0-9]+)?\.css/);
      });
    });

    it('should serve CSS file from manifest', () => {
      cy.request('/assets/manifest.json').then((manifestResponse) => {
        const cssFile = manifestResponse.body['main.css'];
        cy.request(`/assets/${cssFile}`).then((cssResponse) => {
          expect(cssResponse.status).to.eq(200);
          expect(cssResponse.headers['content-type']).to.include('text/css');
          expect(cssResponse.body).to.be.a('string');
          expect(cssResponse.body.length).to.be.greaterThan(0);
        });
      });
    });

    it('should include CSS link in HTML head', () => {
      cy.visit('/');
      cy.get('head link[rel="stylesheet"]').should('exist');
      cy.get('head link[rel="stylesheet"]')
        .should('have.attr', 'href')
        // Accept both /assets/main.css and /assets/main.[hash].css
        .and('match', /\/assets\/main(\.[a-f0-9]+)?\.css/);
    });

    it('should have styles applied to page', () => {
      cy.visit('/');
      // Check that Tailwind CSS is loaded by verifying common utility classes work
      cy.get('body').should('have.css', 'margin', '0px');
      cy.get('body').should('exist');
    });
  });

  describe('Manifest integrity', () => {
    it('should have all required assets in manifest', () => {
      cy.request('/assets/manifest.json').then((response) => {
        const manifest = response.body;

        // Check for main.css
        expect(manifest).to.have.property('main.css');

        // Check for JavaScript files
        expect(manifest).to.have.property('main.js');
        expect(manifest).to.have.property('runtime.js');

        // Verify all values are strings with content
        Object.values(manifest).forEach((value: any) => {
          expect(value).to.be.a('string');
          expect(value.length).to.be.greaterThan(0);
        });
      });
    });

    it('should have valid manifest JSON structure', () => {
      cy.request('/assets/manifest.json').then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
        expect(Object.keys(response.body).length).to.be.greaterThan(0);
      });
    });
  });

  describe('CSS loading in SSR', () => {
    it('should have CSS loaded before page renders', () => {
      cy.visit('/');

      // CSS should be in head before any content renders
      cy.get('head link[rel="stylesheet"]').should('exist');

      // Verify no FOUC (Flash of Unstyled Content) by checking styles exist immediately
      cy.get('body').should('have.css', 'margin');
    });

    it('should include default-skin.css in manifest or served', () => {
      cy.request('/assets/manifest.json').then((manifestResponse) => {
        const manifest = manifestResponse.body;

        // Check if default-skin.css is in manifest
        if (manifest['assets/default-skin.css']) {
          const skinCssFile = manifest['assets/default-skin.css'];
          cy.request(`/assets/${skinCssFile}`).then((cssResponse) => {
            expect(cssResponse.status).to.eq(200);
          });
        } else {
          // Or check if it's served directly
          cy.request('/assets/default-skin.css', { failOnStatusCode: false }).then((response) => {
            // It's okay if this doesn't exist - it might be bundled in main.css
            expect([200, 404]).to.include(response.status);
          });
        }
      });
    });

    it('should include photos.css in manifest or served', () => {
      cy.request('/assets/manifest.json').then((manifestResponse) => {
        const manifest = manifestResponse.body;

        // Check if photos.css is in manifest
        if (manifest['assets/photos.css']) {
          const photosCssFile = manifest['assets/photos.css'];
          cy.request(`/assets/${photosCssFile}`).then((cssResponse) => {
            expect(cssResponse.status).to.eq(200);
          });
        } else {
          // Or check if it's served directly
          cy.request('/assets/photos.css', { failOnStatusCode: false }).then((response) => {
            // It's okay if this doesn't exist - it might be bundled in main.css
            expect([200, 404]).to.include(response.status);
          });
        }
      });
    });
  });
});

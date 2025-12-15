import React from 'react';
import { Html } from './html';

describe('Html function', () => {
  const mockScripts = [
    '/assets/runtime.123.js',
    '/assets/main.456.js',
  ];

  const mockHelmet = {
    title: '<title>Test Title</title>',
    meta: '<meta name="description" content="Test description" /><meta property="og:title" content="Test OG Title" />',
    link: '<link rel="canonical" href="https://example.com" />',
    script: '<script type="application/ld+json">{"@context": "test"}</script>',
  };

  const mockLoadableScripts = [
    <script key="loadable-1" src="/chunk1.js" defer />,
    <script key="loadable-2" src="/chunk2.js" defer />,
  ];

  const mockLoadableLinks = [
    <link key="preload-1" rel="preload" href="/chunk1.js" as="script" />,
  ];

  const mockLoadableStyles = [
    <style key="style-1">{'body { margin: 0; }'}</style>,
  ];

  describe('helmet rendering', () => {
    test('should render helmet title', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<title>Test Title</title>');
    });

    test('should render helmet meta tags', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<meta name="description" content="Test description" />');
      expect(html).toContain('<meta property="og:title" content="Test OG Title" />');
    });

    test('should render helmet link tags', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<link rel="canonical" href="https://example.com" />');
    });

    test('should handle empty helmet strings', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: {
          title: '',
          meta: '',
          link: '',
          script: '',
        },
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      // Should not crash and should still render other head elements
      expect(html).toContain('<link href="/assets/main.css" rel="stylesheet" />');
      expect(html).toContain('<meta charset="utf-8" />');
    });
  });

  describe('CSS paths rendering', () => {
    const testCases = [
      {
        scenario: 'local paths',
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
      },
      {
        scenario: 'CDN paths with versioning',
        mainCssPath: 'https://cdn.example.com/0.1.0/main.abc123.css',
        defaultSkinCssPath: 'https://cdn.example.com/0.1.0/default-skin.def456.css',
        photosCssPath: 'https://cdn.example.com/0.1.0/photos.ghi789.css',
      },
    ];

    test.each(testCases)(
      'should render CSS links with $scenario',
      ({ mainCssPath, defaultSkinCssPath, photosCssPath }) => {
        const html = Html({
          content: '<div>Test content</div>',
          state: {},
          helmet: mockHelmet,
          mainCssPath,
          defaultSkinCssPath,
          photosCssPath,
          scripts: mockScripts,
        });

        expect(html).toContain(`<link href="${mainCssPath}" rel="stylesheet" />`);
        expect(html).toContain(`<link href="${defaultSkinCssPath}" rel="stylesheet" />`);
        expect(html).toContain(`<link href="${photosCssPath}" rel="stylesheet" />`);
      }
    );

    test('should render CSS links in head (not body)', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      const headEnd = html.indexOf('</head>');
      const mainCssIndex = html.indexOf('href="/assets/main.css"');
      const defaultSkinCssIndex = html.indexOf('href="/assets/default-skin.css"');
      const photosCssIndex = html.indexOf('href="/assets/photos.css"');

      // All CSS links should appear before </head>
      expect(mainCssIndex).toBeLessThan(headEnd);
      expect(defaultSkinCssIndex).toBeLessThan(headEnd);
      expect(photosCssIndex).toBeLessThan(headEnd);
    });
  });

  describe('loadable components rendering', () => {
    test('should render loadable styles in head', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
        loadableStyles: mockLoadableStyles,
      });

      const headEnd = html.indexOf('</head>');
      const styleIndex = html.indexOf('body { margin: 0; }');

      expect(styleIndex).toBeGreaterThan(0);
      expect(styleIndex).toBeLessThan(headEnd);
    });

    test('should render loadable links in head', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
        loadableLinks: mockLoadableLinks,
      });

      const headEnd = html.indexOf('</head>');
      const preloadIndex = html.indexOf('rel="preload"');

      expect(preloadIndex).toBeGreaterThan(0);
      expect(preloadIndex).toBeLessThan(headEnd);
    });

    test('should render loadable scripts in body', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
        loadableScripts: mockLoadableScripts,
      });

      const bodyStart = html.indexOf('<body>');
      const bodyEnd = html.indexOf('</body>');
      const chunk1Index = html.indexOf('src="/chunk1.js"');
      const chunk2Index = html.indexOf('src="/chunk2.js"');

      expect(chunk1Index).toBeGreaterThan(bodyStart);
      expect(chunk1Index).toBeLessThan(bodyEnd);
      expect(chunk2Index).toBeGreaterThan(bodyStart);
      expect(chunk2Index).toBeLessThan(bodyEnd);
    });

    test('should handle empty loadable arrays', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
        loadableScripts: [],
        loadableLinks: [],
        loadableStyles: [],
      });

      // Should render successfully without loadable components
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<title>Test Title</title>');
    });

    test('should use default empty arrays when loadable props not provided', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      // Should render successfully without errors
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });
  });

  describe('script rendering', () => {
    test('should render all scripts with defer attribute', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<script src="/assets/runtime.123.js" defer></script>');
      expect(html).toContain('<script src="/assets/main.456.js" defer></script>');
    });

    test('should render scripts in body', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      const bodyStart = html.indexOf('<body>');
      const scriptIndex = html.indexOf('src="/assets/runtime.123.js"');

      expect(scriptIndex).toBeGreaterThan(bodyStart);
    });

    test('should handle empty scripts array', () => {
      const html = Html({
        content: '<div>Test content</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: [],
      });

      // Should render successfully
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });
  });

  describe('content rendering', () => {
    test('should render content inside root div', () => {
      const testContent = '<div class="app"><h1>Hello World</h1></div>';
      const html = Html({
        content: testContent,
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<div id="root">');
      expect(html).toContain(testContent);
    });

    test('should handle empty content', () => {
      const html = Html({
        content: '',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<div id="root"></div>');
    });
  });

  describe('Apollo state injection', () => {
    test('should inject Apollo state as window variable', () => {
      const state = {
        'Post:123': {
          __typename: 'Post',
          id: '123',
          title: 'Test Post',
        },
      };

      const html = Html({
        content: '<div>Test</div>',
        state,
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('window.__APOLLO_STATE__=');
      expect(html).toContain('"Post:123"');
      expect(html).toContain('"title":"Test Post"');
    });

    test('should escape < characters in Apollo state to prevent XSS', () => {
      const state = {
        'Post:123': {
          title: '<script>alert("xss")</script>',
        },
      };

      const html = Html({
        content: '<div>Test</div>',
        state,
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      // < should be escaped as \u003c to prevent breaking out of script tag
      expect(html).toContain('\\u003cscript>');
      expect(html).not.toContain('<script>alert("xss")</script>');
    });

    test('should handle empty Apollo state', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('window.__APOLLO_STATE__={}');
    });

    test('should render Apollo state script in body before other scripts', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: { test: 'data' },
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      const apolloStateIndex = html.indexOf('window.__APOLLO_STATE__');
      const runtimeScriptIndex = html.indexOf('src="/assets/runtime.123.js"');

      expect(apolloStateIndex).toBeLessThan(runtimeScriptIndex);
    });
  });

  describe('meta tags', () => {
    test('should render charset and viewport meta tags', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toContain('<meta charset="utf-8" />');
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    });

    test('should render meta tags in head', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      const headEnd = html.indexOf('</head>');
      const charsetIndex = html.indexOf('charset="utf-8"');
      const viewportIndex = html.indexOf('name="viewport"');

      expect(charsetIndex).toBeLessThan(headEnd);
      expect(viewportIndex).toBeLessThan(headEnd);
    });
  });

  describe('HTML structure', () => {
    test('should render valid HTML structure', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      // Check proper nesting
      const htmlStart = html.indexOf('<html>');
      const headStart = html.indexOf('<head>');
      const headEnd = html.indexOf('</head>');
      const bodyStart = html.indexOf('<body>');
      const bodyEnd = html.indexOf('</body>');
      const htmlEnd = html.indexOf('</html>');

      expect(htmlStart).toBeLessThan(headStart);
      expect(headStart).toBeLessThan(headEnd);
      expect(headEnd).toBeLessThan(bodyStart);
      expect(bodyStart).toBeLessThan(bodyEnd);
      expect(bodyEnd).toBeLessThan(htmlEnd);
    });

    test('should include DOCTYPE declaration', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      expect(html).toMatch(/^<!DOCTYPE html>/);
    });

    test('should not contain React component wrappers in head', () => {
      const html = Html({
        content: '<div>Test</div>',
        state: {},
        helmet: mockHelmet,
        mainCssPath: '/assets/main.css',
        defaultSkinCssPath: '/assets/default-skin.css',
        photosCssPath: '/assets/photos.css',
        scripts: mockScripts,
      });

      const headContent = html.substring(
        html.indexOf('<head>'),
        html.indexOf('</head>') + 7
      );

      // Helmet content should be directly in head, not wrapped in divs
      // (This was the original bug we fixed)
      const titleIndex = headContent.indexOf('<title>Test Title</title>');
      const divBeforeTitle = headContent.substring(0, titleIndex).lastIndexOf('<div');

      // There should be no div tag between <head> and <title>
      expect(divBeforeTitle).toBe(-1);
    });
  });
});

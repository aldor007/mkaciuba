import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Html } from './html';

describe('Html component', () => {
  const mockScripts = [
    '/assets/runtime.123.js',
    '/assets/main.456.js',
  ];

  const mockHelmet = {
    title: {
      toComponent: jest.fn(() => <title>Test Title</title>),
    },
    meta: {
      toComponent: jest.fn(() => (
        <>
          <meta name="description" content="Test description" />
          <meta property="og:title" content="Test OG Title" />
        </>
      )),
    },
    link: {
      toComponent: jest.fn(() => <link rel="canonical" href="https://example.com" />),
    },
    script: {
      toComponent: jest.fn(() => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: '{"@context": "test"}' }} />),
    },
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('helmet rendering', () => {
    test('should call helmet toComponent methods', () => {
      renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(mockHelmet.title.toComponent).toHaveBeenCalled();
      expect(mockHelmet.meta.toComponent).toHaveBeenCalled();
      expect(mockHelmet.link.toComponent).toHaveBeenCalled();
      expect(mockHelmet.script.toComponent).toHaveBeenCalled();
    });

    test('should render helmet components in head', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('<title>Test Title</title>');
      expect(html).toContain('<meta name="description" content="Test description"/>');
      expect(html).toContain('<meta property="og:title" content="Test OG Title"/>');
      expect(html).toContain('<link rel="canonical" href="https://example.com"/>');
    });

    test('should handle null helmet gracefully', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={null}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      // Should not crash and should still render other head elements
      expect(html).toContain('<link href="/assets/main.css" rel="stylesheet"/>');
      expect(html).toContain('<meta charSet="utf-8"/>');
    });

    test('should handle undefined helmet gracefully', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={undefined}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      // Should not crash and should still render other head elements
      expect(html).toContain('<link href="/assets/main.css" rel="stylesheet"/>');
      expect(html).toContain('<meta charSet="utf-8"/>');
    });

    test('should handle partial helmet with missing methods', () => {
      const partialHelmet = {
        title: { toComponent: jest.fn(() => <title>Test</title>) },
        meta: { toComponent: jest.fn(() => null) },
        // link and script missing
      };

      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={partialHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      // Should not crash
      expect(html).toContain('<title>Test</title>');
      expect(html).toContain('<link href="/assets/main.css" rel="stylesheet"/>');
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
        const html = renderToStaticMarkup(
          <Html
            content="<div>Test content</div>"
            state={{}}
            helmet={mockHelmet}
            mainCssPath={mainCssPath}
            defaultSkinCssPath={defaultSkinCssPath}
            photosCssPath={photosCssPath}
            scripts={mockScripts}
          />
        );

        expect(html).toContain(`<link href="${mainCssPath}" rel="stylesheet"/>`);
        expect(html).toContain(`<link href="${defaultSkinCssPath}" rel="stylesheet"/>`);
        expect(html).toContain(`<link href="${photosCssPath}" rel="stylesheet"/>`);
      }
    );

    test('should render CSS links in head (not body)', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

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
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
          loadableStyles={mockLoadableStyles}
        />
      );

      const headEnd = html.indexOf('</head>');
      const styleIndex = html.indexOf('body { margin: 0; }');

      expect(styleIndex).toBeGreaterThan(0);
      expect(styleIndex).toBeLessThan(headEnd);
    });

    test('should render loadable links in head', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
          loadableLinks={mockLoadableLinks}
        />
      );

      const headEnd = html.indexOf('</head>');
      const preloadIndex = html.indexOf('rel="preload"');

      expect(preloadIndex).toBeGreaterThan(0);
      expect(preloadIndex).toBeLessThan(headEnd);
    });

    test('should render loadable scripts in body', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
          loadableScripts={mockLoadableScripts}
        />
      );

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
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
          loadableScripts={[]}
          loadableLinks={[]}
          loadableStyles={[]}
        />
      );

      // Should render successfully without loadable components
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<title>Test Title</title>');
    });

    test('should use default empty arrays when loadable props not provided', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      // Should render successfully without errors
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });
  });

  describe('script rendering', () => {
    test('should render all scripts with defer attribute', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('<script src="/assets/runtime.123.js" defer=""></script>');
      expect(html).toContain('<script src="/assets/main.456.js" defer=""></script>');
    });

    test('should render scripts in body', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      const bodyStart = html.indexOf('<body>');
      const scriptIndex = html.indexOf('src="/assets/runtime.123.js"');

      expect(scriptIndex).toBeGreaterThan(bodyStart);
    });

    test('should handle empty scripts array', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test content</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={[]}
        />
      );

      // Should render successfully
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });
  });

  describe('content rendering', () => {
    test('should render content inside root div', () => {
      const testContent = '<div class="app"><h1>Hello World</h1></div>';
      const html = renderToStaticMarkup(
        <Html
          content={testContent}
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('<div id="root">');
      expect(html).toContain(testContent);
    });

    test('should handle empty content', () => {
      const html = renderToStaticMarkup(
        <Html
          content=""
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('<div id="root"></div>');
    });

    test('should render content with special characters', () => {
      const testContent = '<div>Test &amp; Content &lt;script&gt;</div>';
      const html = renderToStaticMarkup(
        <Html
          content={testContent}
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain(testContent);
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

      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={state}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

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

      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={state}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      // < should be escaped as \u003c to prevent breaking out of script tag
      expect(html).toContain('\\u003cscript>');
      expect(html).not.toContain('<script>alert("xss")</script>');
    });

    test('should handle empty Apollo state', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('window.__APOLLO_STATE__={}');
    });

    test('should render Apollo state script in body before other scripts', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{ test: 'data' }}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      const apolloStateIndex = html.indexOf('window.__APOLLO_STATE__');
      const runtimeScriptIndex = html.indexOf('src="/assets/runtime.123.js"');

      expect(apolloStateIndex).toBeLessThan(runtimeScriptIndex);
    });
  });

  describe('meta tags', () => {
    test('should render charset and viewport meta tags', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      expect(html).toContain('<meta charSet="utf-8"/>');
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"/>');
    });

    test('should render meta tags in head', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      const headEnd = html.indexOf('</head>');
      const charsetIndex = html.indexOf('charSet="utf-8"');
      const viewportIndex = html.indexOf('name="viewport"');

      expect(charsetIndex).toBeLessThan(headEnd);
      expect(viewportIndex).toBeLessThan(headEnd);
    });
  });

  describe('HTML structure', () => {
    test('should render valid HTML structure', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

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

    test('should not contain div wrapper in head', () => {
      const html = renderToStaticMarkup(
        <Html
          content="<div>Test</div>"
          state={{}}
          helmet={mockHelmet}
          mainCssPath="/assets/main.css"
          defaultSkinCssPath="/assets/default-skin.css"
          photosCssPath="/assets/photos.css"
          scripts={mockScripts}
        />
      );

      const headContent = html.substring(
        html.indexOf('<head>'),
        html.indexOf('</head>') + 7
      );

      // The original bug: should not have <div> in head
      expect(headContent).not.toContain('<div');
    });
  });
});

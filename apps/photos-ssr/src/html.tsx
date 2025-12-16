import { renderToStaticMarkup } from 'react-dom/server';

interface HelmetData {
  title: string;
  meta: string;
  link: string;
  script: string;
}

export function Html({
  content,
  state,
  helmet,
  mainCssPath,
  defaultSkinCssPath,
  photosCssPath,
  scripts,
  loadableScripts = [],
  loadableLinks = [],
  loadableStyles = [],
  initialViewport
}: {
  content: string;
  state: any;
  helmet: HelmetData;
  mainCssPath: string;
  defaultSkinCssPath: string;
  photosCssPath: string;
  scripts: string[];
  loadableScripts?: any[];
  loadableLinks?: any[];
  loadableStyles?: any[];
  initialViewport?: number;
}): string {
  // Render loadable components to strings
  const loadableStylesHtml = loadableStyles.length > 0
    ? loadableStyles.map(s => renderToStaticMarkup(s)).join('')
    : '';
  const loadableLinksHtml = loadableLinks.length > 0
    ? loadableLinks.map(l => renderToStaticMarkup(l)).join('')
    : '';
  const loadableScriptsHtml = loadableScripts.length > 0
    ? loadableScripts.map(s => renderToStaticMarkup(s)).join('')
    : '';

  // Build script tags for main scripts
  const scriptTags = scripts.map(src => `<script src="${src}" defer></script>`).join('');

  // Build the complete HTML document as a string
  return `<!DOCTYPE html>
<html>
  <head>
    ${helmet.title}
    ${helmet.meta}
    ${helmet.link}
    ${helmet.script}
    <link href="${mainCssPath}" rel="stylesheet" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="${defaultSkinCssPath}" rel="stylesheet" />
    <link href="${photosCssPath}" rel="stylesheet" />
    ${loadableStylesHtml}
    ${loadableLinksHtml}
    <script>window.__INITIAL_VIEWPORT__=${initialViewport || 1900};</script>
  </head>
  <body>
    <div id="root">${content}</div>
    <script>window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};</script>
    ${loadableScriptsHtml}
    ${scriptTags}
  </body>
</html>`;
}

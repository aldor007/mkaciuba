import React from 'react';

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
  loadableStyles = []
}) {
  const scriptSrc = scripts.map(s => (
     <script key={s} src={s} defer></script>
  ))

  return (
    <html>
      <head>
        {helmet?.title?.toComponent()}
        {helmet?.meta?.toComponent()}
        {helmet?.link?.toComponent()}
        {helmet?.script?.toComponent()}
        <link href={mainCssPath} rel="stylesheet" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href={defaultSkinCssPath} rel="stylesheet" />
        <link href={photosCssPath} rel="stylesheet" />
        {loadableStyles}
        {loadableLinks}
      </head>

      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <script dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
        }} />
        {loadableScripts}
        {scriptSrc}
        </body>

    </html>
  );
}

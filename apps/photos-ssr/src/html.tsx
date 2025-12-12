import React from 'react';

export function Html({ content, state, meta, scripts, loadableScripts = [], loadableLinks = [] }) {
  const scriptSrc = scripts.map(s => (
     <script key={s} src={s} defer></script>
  ))

  return (
    <html>
      <head>
        <div dangerouslySetInnerHTML={{ __html: meta}} />
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

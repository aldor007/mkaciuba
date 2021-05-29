import React from 'react';

export function Html({ content, state, meta }) {
  return (
    <html>
      <head dangerouslySetInnerHTML={{ __html: meta}}>

      </head>

      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <script dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
        }} />
        <script src="/assets/runtime.js" defer></script>
        <script src="/assets/polyfills.js" defer></script>
        <script src="/assets/vendor.js" defer></script>
        <script src="/assets/main.js" defer></script></body>

    </html>
  );
}

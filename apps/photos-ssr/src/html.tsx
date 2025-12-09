import React from 'react';

export function Html({ children, state, meta, scripts }) {
  const scriptSrc = scripts.map(s => (
     <script key={s} src={s} defer></script>
  ))

  return (
    <html>
      <head dangerouslySetInnerHTML={{ __html: meta}}>
      </head>

      <body>
        <div id="root">{children}</div>
        <script dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
        }} />
        {scriptSrc}
        </body>

    </html>
  );
}

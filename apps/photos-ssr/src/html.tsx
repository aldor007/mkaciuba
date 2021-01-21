import React from 'react';

export function Html({ content, state }) {
  return (
    <html>
      <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet"/>
      <link href="/main.css" rel="stylesheet"/>
      <link href="/assets/photos.css" rel="stylesheet"/>

      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <script dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
        }} />
        <script src="/runtime.js" defer></script>
        <script src="/polyfills.js" defer></script>
        <script src="/vendor.js" defer></script>
        <script src="/main.js" defer></script></body>

    </html>
  );
}

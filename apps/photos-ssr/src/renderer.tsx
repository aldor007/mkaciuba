import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import serialize from 'serialize-javascript';
import { Helmet } from 'react-helmet';
import { ServerStyleSheets } from '@material-ui/core/styles';
import React from 'react';

import { Routes } from '@mkaciuba/photos';
import { dom } from "@fortawesome/fontawesome-svg-core";
import { Request, Response } from 'express';

export default (req: Request, store, context) => {
  const sheets = new ServerStyleSheets();
  const content = renderToString(
    sheets.collect(
      // <Provider store={store}>
        <StaticRouter location={req.path} context={context}>
          <div>{renderRoutes(Routes)}</div>
        </StaticRouter>
      // </Provider>
      )
  );
  const css = sheets.toString();
  const assetsPath = 'http://localhost:4200'
  const helmet = Helmet.renderStatic();
  return `<!DOCTYPE html>
            <head>
                ${helmet.title.toString()}
                ${helmet.meta.toString()}
                ${helmet.link.toString()}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

                <style type="text/css">${dom.css()}</style>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossorigin="anonymous"
        />
                <style id="jss-server-side">${css}</style>

            </head>
            <body>
            <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
            <script dangerouslySetInnerHTML={{
              __html: window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};,
            }} />
                <!--- <script src="${assetsPath}/runtime.js" defer></script> --->
                <script src="${assetsPath}/polyfills.js" defer></script>
                <script src="${assetsPath}/vendor.js" defer></script>
                <script src="${assetsPath}/main.js" defer></script></body>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            </body>
    </html>`;
};

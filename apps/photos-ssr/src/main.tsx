/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import renderer from './renderer';
import 'cross-fetch/polyfill';

import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';
import { getDataFromTree } from "@apollo/client/react/ssr";
import React from 'react';
import path from 'path';

import { Routes, App } from '@mkaciuba/photos';
import { matchRoutes } from 'react-router-config';
import { Html } from './html'
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import MetaTagsServer from 'react-meta-tags/server';
import {MetaTagsContext} from 'react-meta-tags';
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from 'crypto-hash';
import { BatchHttpLink } from "@apollo/client/link/batch-http";


const app = express();
console.log(__dirname)
app.use('/assets',
    express.static(path.join(__dirname, '../photos'))
 );

app.get('*', (req, res) => {
  const params = req.params[0].split('/');
  const id = params[2];
  const metaTagsInstance = MetaTagsServer();

  const persistedQueriesLink = createPersistedQueryLink({ sha256 });

  const client = new ApolloClient({
    ssrMode: true,
    link: persistedQueriesLink.concat(new BatchHttpLink({
      uri: 'http://localhost:1337/graphql',
      credentials: 'same-origin',
      headers: {
        cookie: req.header('Cookie'),
      },
    })),
    cache: new InMemoryCache(),
  });

    const context = {};

  // Checks the given path, matches with component and returns array of items about to be rendered
  const routes = matchRoutes(Routes, req.path);
  const staticApp = (
          <StaticRouter location={req.url} context={context}>
            <MetaTagsContext extract = {metaTagsInstance.extract}>
              <App client={client} />
              </MetaTagsContext>
          </StaticRouter>
  )
  if (routes.length === 0) {
    res.status(404);
    res.send();
    return;
  }

  console.info('Before getDataFromTree', routes)
  getDataFromTree(staticApp).then((content) => {
    // Extract the entirety of the Apollo Client cache's current state
    const initialState = client.extract();
    const meta =    `<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet"/>
      <link href="/assets/assets/main.css" rel="stylesheet"/>
      <link href="/assets/assets/default-skin.css" rel="stylesheet"/>
      <link href="/assets/assets/photos.css" rel="stylesheet"/>${metaTagsInstance.renderToString()}`


    // Add both the page content and the cache state to a top-level component
    const html = <Html content={content} state={initialState} meta={meta} />;

    // Render the component to static markup and return it
    // res.status(200);
    renderToNodeStream(html).pipe(res);
    // res.end();
  }).catch((e) => {
    console.error('Error reading', e)
  });


});


const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

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
import { HttpLink } from "@apollo/client/core";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { environment } from './environments/environment';
import cookeParser from 'cookie-parser';
import proxy from 'express-http-proxy';
import fs from 'fs';
import pkgJson from  '../../../package.json';

const assetsPath = path.join(__dirname, '../photos');
const manifest = JSON.parse(fs.readFileSync(path.join(assetsPath, 'manifest.json'), 'utf-8'));

const getAssetPath = (name) => {
  console.info('DEBUG ', name, process.env.ASSETS_URL, manifest[name])
  if (manifest[name]) {
    return process.env.ASSETS_URL + '/' + manifest[name];
  }
};

let scripts = [];
const vendorsPath = getAssetPath('vendor.js');
if (!vendorsPath) {
  scripts.push(getAssetPath("vendors~main.js"))
  scripts.push(getAssetPath("vendors~polyfills.js"))
} else {
  scripts.push(vendorsPath);
  scripts.push(getAssetPath('polyfills.js'))
}

scripts.push(getAssetPath('runtime.js'))
scripts.push(getAssetPath('main.js'))

scripts = scripts.filter(x => x)

const app = express();
app.use(cookeParser())

app.use('/graphql', proxy(process.env.STRAPI_URL || environment.strapiUrl, {
  proxyReqPathResolver: function (req) {
    return '/graphql' + req.url.replace('/', '');
  }
}));

app.use('/assets',
    express.static(assetsPath, {
      maxAge: '7d',
    })
 );

app.get('/_health', (req, res) => {
  res.sendStatus(200)
});

app.get('*', (req, res) => {
  const metaTagsInstance = MetaTagsServer();

  const client = new ApolloClient({
    ssrMode: true,
    link: new BatchHttpLink({
      uri:  process.env.API_URL || environment.apiUrl,
      credentials: 'same-origin',
      headers: {
        cookie: req.header('Cookie'),
        'x-gallery-token': req.headers['x-gallery-token']
      },
    }),
    cache: new InMemoryCache(),
  });

  const context = {};

  console.info('Request ', req.path, req.url)
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
    res.sendStatus(404);
    return;
  }

  getDataFromTree(staticApp).then((content) => {
    // Extract the entirety of the Apollo Client cache's current state
    const initialState = client.extract();
    const meta =    `
      <link href="${getAssetPath('main.css')}" rel="stylesheet"/>
      <meta charset="utf-8">
      <link href="${getAssetPath('assets/default-skin.css')}" rel="stylesheet"/>
      <link href="${getAssetPath('assets/photos.css')}" rel="stylesheet"/>${metaTagsInstance.renderToString()}`


    // Add both the page content and the cache state to a top-level component
    const html = <Html content={content} state={initialState} meta={meta} scripts={scripts}/>;
    if (!req.cookies.category_token) {
      res.setHeader('cache-control', 'public, max-age=120')
      res.setHeader('x-browser-cache-control', 'public, max-age=60');
    } else {
      res.setHeader('cache-control', 'privte, max-age=60')
    }

    // Render the component to static markup and return it
    // res.status(200);
    renderToNodeStream(html).pipe(res);
    // res.end();
  }).catch((e) => {
    console.error('Error reading', e)
    res.status(503);
    res.send(e.message);
  });


});

console.info('Scripts', scripts, process.env.NODE_ENV)
console.info('Apollo url' , process.env.API_URL || environment.apiUrl);

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${port}`);
});
server.on('error', console.error);

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
import LRUCache from 'lru-cache';

const assetsPath = path.join(__dirname, '../photos');
const manifest = JSON.parse(fs.readFileSync(path.join(assetsPath, 'manifest.json'), 'utf-8'));
const cache = new LRUCache({
  max: 100,
  maxAge: 1000 * 60,
  allowStale : true
})

const getCacheKey = (req) => {
  return `${req.path}|${req.headers['x-gallery-token']}|${req.cookies.category_token}`
}

const getAssetPath = (name) => {
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

app.get('*', async (req, res) => {
  const metaTagsInstance = MetaTagsServer();
  const reqPath = req.path;

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
  const cacheKey = getCacheKey(req)
  const cacheData = cache.peek(cacheKey);
  const headTags = metaTagsInstance.renderToString().replace('<div class="react-head-temp">', '').replace('</div>', '')
  const renderPage = async () => {
    try {
      const content = await getDataFromTree(staticApp);
      // Extract the entirety of the Apollo Client cache's current state
      const initialState = client.extract();
      const headTags = metaTagsInstance.renderToString().replace('<div class="react-head-temp">', '').replace('</div>')
      const meta =    `${headTags}
        <link href="${getAssetPath('main.css')}" rel="stylesheet"/>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="${getAssetPath('assets/default-skin.css')}" rel="stylesheet"/>
        <link href="${getAssetPath('assets/photos.css')}" rel="stylesheet"/>`


      // Add both the page content and the cache state to a top-level component
      const html = <Html content={content} state={initialState} meta={meta} scripts={scripts}/>;
      const headers = {
        'content-type': 'text/html; charset=UTF-8',
      };
      const keys = Object.keys(initialState)
      if (!req.cookies.category_token || !reqPath.includes('gallery')) {
        if (keys.length > 0 && keys[0].includes('post')) {
          const post = initialState[keys[0]];
          if (post.publicationDate && (new Date(post.publicationDate as string)) < new Date()) {
            headers['cache-control'] = 'public, max-age=600'
            headers['x-browser-cache-control'] = 'public, max-age=160';
          } else {
            headers['cache-control'] =  'public, max-age=60'
            headers['x-browser-cache-control'] = 'private, max-age=60';
          }
        } else {
            headers['cache-control'] = 'public, max-age=600'
            headers['x-browser-cache-control'] = 'public, max-age=160';
        }
      } else {
        headers['cache-control'] = 'private, max-age=60'
      }

      if (reqPath.includes('gallery-login')) {
        headers['cache-control']  = 'no-cache'
        headers['x-browser-cache-control'] =  'no-cache';
      }

      if (keys.length == 0) {
        headers['cache-control']  = 'no-cache'
        headers['x-browser-cache-control'] =  'no-cache';
      }

      return  {
        headers: headers,
        html,
      }

    } catch (e) {
      console.error('Error reading', e)
      res.status(503);
      res.send(e.message);
    }
  }
  if (cacheData) {
      cacheData.headers['x-lru'] = 'hit'
      res.set(cacheData.headers)
      renderToNodeStream(cacheData.html).pipe(res);
      if (!cache.get(cacheKey)) {
          const refreshData = await renderPage()
          cache.set(cacheKey, refreshData)
      }
  } else {
    const cacheData = await renderPage()
    if (cacheData) {
      res.set(cacheData.headers)
      renderToNodeStream(cacheData.html).pipe(res);
       cache.set(cacheKey, cacheData)
    }
  }

});

console.info('Scripts', scripts, process.env.NODE_ENV)
console.info('Apollo url' , process.env.API_URL || environment.apiUrl);

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${port}`);
});
server.on('error', console.error);

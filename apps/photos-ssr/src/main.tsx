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
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { ErrorPage } from '@mkaciuba/ui-kit';
import { StaticRouter } from 'react-router';
import MetaTagsServer from 'react-meta-tags/server';
import {MetaTagsContext} from 'react-meta-tags';
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { environment } from './environments/environment';
import cookeParser from 'cookie-parser';
import proxy from 'express-http-proxy';
import fs from 'fs';
import pkgJson from  '../../../package.json';
import { Cache } from './redis';
const API_KEY = process.env.API_KEY || '123';
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const assetsPath = path.join(__dirname, '../photos');
const manifestPath = path.join(assetsPath, 'manifest.json');
let manifest;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  try {
    manifest = JSON.parse(manifestContent);
  } catch (parseError) {
    console.error(`Failed to parse JSON from manifest file at "${manifestPath}". Content preview: "${manifestContent?.substring(0, 200)}...". Error: ${parseError.message}`);
    throw new Error(`Invalid JSON in manifest file: ${parseError.message}`);
  }
} catch (readError) {
  if (readError.message.includes('Invalid JSON')) {
    throw readError;
  }
  console.error(`Failed to read manifest file at "${manifestPath}". Error: ${readError.message}`);
  throw new Error(`Cannot read manifest file: ${readError.message}`);
}
const cache = new Cache()
setImmediate(async () => {
  if (process.env.REDIS_PORT && process.env.REDIS_DB) {
   await cache.init(process.env.REDIS_URL, parseInt(process.env.REDIS_PORT), parseInt(process.env.REDIS_DB))
  }
})

const getCacheKey = (req) => {
  return `v3:${req.path}|${req.query.page || ''}|${req.headers['x-gallery-token'] || ''}|${req.cookies.category_token || ''}`
}

const getAssetPath = (name) => {
  if (manifest[name]) {
    return (process.env.ASSETS_URL || '/assets') + '/' + manifest[name];
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

async function toCacheObject(cacheData) {
  return {
    html:await renderToString(cacheData.html),
    headers: cacheData.headers
  }
}

function renderErrorPage(code: number, message?: string) {
  const errorHtml = <Html
    content={<ErrorPage code={code} message={message} />}
    state={{}}
    meta={`
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="${getAssetPath('main.css')}" rel="stylesheet"/>
      <title>${code} Error | mkaciuba.pl</title>
    `}
    scripts={scripts}
  />;
  return renderToString(errorHtml);
}

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

app.delete('/v1/purge', async (req, res) => {
  if (req.headers['x-api-key'] != API_KEY) {
    res.set({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0'
    });
    return res.sendStatus(403)
  }
  if (!req.query.path) {
    console.info('No url', req.query)
    res.set({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0'
    });
    return res.sendStatus(400)
  }
  const urlParts = new URL(req.query.path as string, "https://mkaciuba.pl")
  const query = {}
  for (let [k, v] of urlParts.searchParams.entries()) {
    query[k] = v
  }
  const cacheReq =  {
    path: urlParts.pathname,
    headers: req.headers,
    cookies: req.cookies,
    query,
  }
  console.info('Purge cache for', getCacheKey(cacheReq))

  // Purge internal cache (LRU + Redis)
  await cache.delete(getCacheKey(cacheReq))

  // Purge Cloudflare cache
  if (CLOUDFLARE_ZONE_ID && CLOUDFLARE_API_TOKEN) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: [req.query.path as string]
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Cloudflare purge failed:', result);
        return res.status(500).json({
          error: 'Cloudflare cache purge failed',
          details: result
        });
      }

      console.info('Cloudflare cache purged successfully for', req.query.path);
      res.status(201).json({
        success: true,
        purged: {
          internal: getCacheKey(cacheReq),
          cloudflare: req.query.path
        }
      });
    } catch (error) {
      console.error('Cloudflare purge error:', error);
      return res.status(500).json({
        error: 'Cloudflare cache purge failed',
        message: error.message
      });
    }
  } else {
    console.warn('Cloudflare credentials not configured, skipping CDN purge');
    res.status(201).json({
      success: true,
      purged: {
        internal: getCacheKey(cacheReq),
        cloudflare: 'skipped (no credentials)'
      }
    });
  }
})

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
    res.status(404);
    res.set({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0',
      'content-type': 'text/html; charset=UTF-8'
    });
    res.send(renderErrorPage(404, 'Page not found'));
    return;
  }
  const cacheKey = getCacheKey(req)
  const cacheData = await cache.get(cacheKey);
  let cacheTTL = 600;
  const renderPage = async () => {
    try {
      const content = await getDataFromTree(staticApp);
      // Extract the entirety of the Apollo Client cache's current state
      const initialState = client.extract();
      const headTags = metaTagsInstance.renderToString().replace('<div class="react-head-temp">', '').replace('</div>', '')
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
            headers['cdn-cache-control'] = 'public, max-age=3600';
            headers['cache-control'] = 'public, max-age=3600';
            headers['x-browser-cache-control'] = 'public, max-age=630';
            cacheTTL = 600
          } else {
            headers['cdn-cache-control'] = 'public, max-age=60';
            headers['cache-control'] = 'public, max-age=60';
            headers['x-browser-cache-control'] = 'private, max-age=60';
            cacheTTL = 10
          }
        } else {
            headers['cdn-cache-control'] = 'public, max-age=5600';
            headers['cache-control'] = 'public, max-age=5600';
            headers['x-browser-cache-control'] = 'public, max-age=3600';
            cacheTTL = 600
        }
      } else {
        headers['cache-control'] = 'private, max-age=60'
        cacheTTL = 10
      }

      if (reqPath.includes('gallery-login')) {
        headers['cdn-cache-control'] = 'no-cache';
        headers['cache-control'] = 'no-cache';
        headers['x-browser-cache-control'] = 'no-cache';
        cacheTTL = 10
      }

      if (keys.length == 0) {
        headers['cdn-cache-control'] = 'no-cache';
        headers['cache-control'] = 'no-cache';
        headers['x-browser-cache-control'] = 'no-cache';
        cacheTTL = 10
      }

      return  {
        headers: headers,
        html,
      }

    } catch (e) {
      console.error('Error rendering page', e)
      res.status(500);
      res.set({
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0',
        'content-type': 'text/html; charset=UTF-8'
      });
      res.send(renderErrorPage(500, e.message));
    }
  }
  if (cacheData) {
      cacheData.headers['x-lru'] = 'hit'
      res.set(cacheData.headers)
      res.send(cacheData.html)
      if (!await cache.get(cacheKey)) {
          const refreshData = await renderPage()
          await cache.set(cacheKey, await toCacheObject(refreshData), cacheTTL)
      }
  } else {
    const cacheData = await renderPage()
    if (cacheData) {
      res.set(cacheData.headers)
      const { pipe } = renderToPipeableStream(cacheData.html, {
        onShellReady() {
          pipe(res);
        },
        onError(error) {
          console.error('SSR streaming error:', error);
        }
      });
      await cache.set(cacheKey, await toCacheObject(cacheData), cacheTTL)
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

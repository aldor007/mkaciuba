import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import '../assets/photos.css'
import { renderRoutes } from 'react-router-config';
import { Routes } from '../routes';
import { ApolloProvider } from '@apollo/client/react';
import {  ApolloClient, InMemoryCache, HttpLink  } from '@apollo/client/core';
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { environment } from '../environments/environment';
import { startLimitPagination } from './apollo';
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from 'crypto-hash';
import { setContext } from '@apollo/client/link/context';
import ReactGA from 'react-ga';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import usePageTracking from '../usePageTracking';
import { Tracking } from './components/Tracking';

Sentry.init({
  dsn: "https://ecd32835e9764a1fb73c95896f1a6a21@o1035151.ingest.sentry.io/6001921",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.3,
});

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
export interface AppsProps {
  client?: any
}

declare global {
  interface Window {
    __APOLLO_STATE__: any;
  }
}
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists

  let token = '';
  if (sessionStorage) {
    token = sessionStorage.getItem('token');
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      'x-gallery-token': token ? token : "",
    }
  }
});

export const App = ({ client }: AppsProps) => {
  if (!client) {
      let link;
      if (environment.production) {
        link = createPersistedQueryLink({ sha256, useGETForHashedQueries: true }).concat(authLink).concat(new HttpLink({
          uri: environment.apiUrl,
          // batchMax: 12, // No more than 5 operations per batch
          // batchInterval: 50, // Wait no more than 20ms after first batched operation
          useGETForQueries: true
        }));
      } else {
        link = (authLink).concat(new HttpLink({
          uri: environment.apiUrl,
          // batchMax: 12, // No more than 5 operations per batch
          // batchInterval: 50, // Wait no more than 20ms after first batched operation
          useGETForQueries: false
        }));
      }
      const cache = new InMemoryCache({
        typePolicies: {
          Category: {
            fields: {
              medias:  startLimitPagination(['where'])
            }
          },
          Query: {
            fields: {
              categories: startLimitPagination(['where', 'limit']),
              posts: startLimitPagination(['where', 'limit'])
            }
          }
        }
      })
    if (window.__APOLLO_STATE__ ) {
      client = new ApolloClient({
        link,
        cache: cache.restore(window.__APOLLO_STATE__),
      });
    } else {
      client = new ApolloClient({
        link,
        cache,
      });
    }
  }
  return (
      <ApolloProvider client={client}>
        <Tracking />
        <ScrollToTop />
        {renderRoutes(Routes)}
      </ApolloProvider>
  );
};

export default App;

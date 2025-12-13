import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import '../assets/photos.css'
// Always use SSR routes (direct imports) to ensure component types match during hydration
// This sacrifices code splitting but fixes hydration mismatches
import { AppRoutesComponent } from '../routes.ssr';
import { ApolloProvider } from '@apollo/client/react';
import {  ApolloClient, InMemoryCache, HttpLink  } from '@apollo/client/core';
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { environment } from '../environments/environment';
import { startLimitPagination } from './apollo';
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from 'js-sha256';
import { setContext } from '@apollo/client/link/context';
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
  routes?: React.ComponentType
}

declare global {
  interface Window {
    __APOLLO_STATE__?: any;
  }
}
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists

  let token = '';
  if (sessionStorage !== undefined) {
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

export const App = ({ client: clientProp, routes }: AppsProps) => {
  // Always use SSR routes (direct imports) to ensure consistent component types during hydration
  const RoutesComponent = routes || AppRoutesComponent;

  // Use provided client (from SSR) or create a new one for client-side
  let client = clientProp;

  if (!client) {
      // Enable persisted queries in all environments for bandwidth savings
      const link = createPersistedQueryLink({
        sha256,
        useGETForHashedQueries: environment.production
      }).concat(authLink).concat(new HttpLink({
        uri: environment.apiUrl,
        // batchMax: 12, // No more than 5 operations per batch
        // batchInterval: 50, // Wait no more than 20ms after first batched operation
        useGETForQueries: environment.production
      }));
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
    if (typeof window !== 'undefined' && window.__APOLLO_STATE__) {
      client = new ApolloClient({
        link,
        cache: cache.restore(window.__APOLLO_STATE__),
        ssrForceFetchDelay: 100,
      });
    } else {
      client = new ApolloClient({
        link,
        cache,
      });
    }
  }

  // Don't wrap in HelmetProvider here - it should be provided by the parent
  // (either SSR code in photos-ssr/main.tsx or client-side in main.tsx)
  return (
    <ApolloProvider client={client}>
      <Tracking />
      <ScrollToTop />
      <RoutesComponent />
    </ApolloProvider>
  );
};

export default App;

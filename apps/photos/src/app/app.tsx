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
  useEffect(() => {
    ReactGA.initialize('UA-21042903-3');
    ReactGA.pageview(window.location.pathname + window.location.search);
  })

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
          useGETForQueries: true
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
        <ScrollToTop />
        {renderRoutes(Routes)}
      </ApolloProvider>
  );
};

export default App;

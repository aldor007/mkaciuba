import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import '../assets/photos.css'
import { renderRoutes } from 'react-router-config';
import { Routes } from '../routes';
import { ApolloProvider } from '@apollo/client/react';
import {  ApolloClient, InMemoryCache  } from '@apollo/client/core';
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { environment } from '../environments/environment';

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


export const App = ({ client }: AppsProps) => {
  if (!client) {
      const link = new BatchHttpLink({
        uri: environment.apiUrl,
        batchMax: 12, // No more than 5 operations per batch
        batchInterval: 50, // Wait no more than 20ms after first batched operation
        useGETForQueries: true
      });
    if (window.__APOLLO_STATE__ ) {
      client = new ApolloClient({
        link,
        cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
      });
    } else {
      client = new ApolloClient({
        link,
        cache: new InMemoryCache()
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

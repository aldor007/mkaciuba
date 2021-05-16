import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import '../assets/photos.css'
import { renderRoutes } from 'react-router-config';
import { Routes } from '../routes';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';
import '../assets/main.css'


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
    if (window.__APOLLO_STATE__ ) {
      client = new ApolloClient({
        uri: '/graphql',
        cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
      });
    } else {
      client = new ApolloClient({
        uri: '/graphql',
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

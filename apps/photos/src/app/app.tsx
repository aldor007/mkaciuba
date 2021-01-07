import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import '../assets/main.css'
import '../assets/photos.css'
import { Home } from './pages/Home'
import { renderRoutes } from 'react-router-config';
import { Routes } from '../routes';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';


const client = new ApolloClient({
  uri: 'http://localhost:1337/graphql',
  cache: new InMemoryCache()
});
export const App = () => {
  return (
      <ApolloProvider client={client}>
        {renderRoutes(Routes)}
      </ApolloProvider>
  );
};

export default App;

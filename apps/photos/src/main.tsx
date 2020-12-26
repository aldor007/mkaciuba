import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';



import App from './app/app';

ReactDOM.hydrate(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
  );

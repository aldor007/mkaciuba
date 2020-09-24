import React, { useEffect, useState } from 'react';
import { Message } from '@mkaciuba/api-interfaces';
import  Header from './Header';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import CssBaseline from '@material-ui/core/CssBaseline';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';
import '../assets/main.css'


const header = {
  brand: {
    imageUrl: 'https://aaa/[;',
    name: 'mkaciuba.pl'
  },
  mainMenu: [
    {
      name: 'Home',
      url: '/'
    }
  ],
  social: [
    {
      url: 'https://facebook.com',
      icon: faFacebook
    }
  ],
  topMenu: [
    {
      name: 'Home',
      url: '/'
    }
  ]
}

const client = new ApolloClient({
  uri: 'http://localhost:1337/graphql',
  cache: new InMemoryCache()
});

export const App = () => {
;

  return (
    <ApolloProvider client={client}>
        <CssBaseline />
        <Header brand={header.brand} mainMenu={header.mainMenu} social={header.social} topMenu={header.topMenu}/>

    </ApolloProvider>
  );
};

export default App;

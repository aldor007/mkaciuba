import React, { useEffect, useState } from 'react';
import { Message } from '@mkaciuba/api-interfaces';
import  Header from './Header';
import CssBaseline from '@material-ui/core/CssBaseline';
import { gql, useQuery, ApolloProvider, ApolloClient, InMemoryCache  } from '@apollo/client';
import '../assets/main.css'
import { ImageList } from './ImagesList';
import { Footer } from './Footer';
import { faFacebook, faGithub, faInstagram, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';


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
      url: 'https://github.com/aldor007',
      icon: faGithub
    },
    {
      url: 'https://twitter.com/mkaciubapl',
      icon: faTwitter
    },
    {
      url: 'https://facebook.com/mkaciubapl',
      icon: faFacebook
    },
    {
      url: 'https://instagram.com/mkaciubapl',
      icon: faInstagram
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
        <ImageList></ImageList>
        <Footer></Footer>
    </ApolloProvider>
  );
};

export default App;


import { ImageList } from '../ImagesList';
import { Footer } from '../Footer';
import { faFacebook, faGithub, faInstagram, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';

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

export const Home = () => {

  return  (
    <>
    <Header brand={header.brand} mainMenu={header.mainMenu} social={header.social} topMenu={header.topMenu}/>
    <Footer></Footer>
    </>
  )
}

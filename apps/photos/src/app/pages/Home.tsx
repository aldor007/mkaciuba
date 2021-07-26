
import { Footer } from '../components/Footer';
import { Posts } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading } from '@mkaciuba/ui-kit';
import MetaTags from 'react-meta-tags';

export const Home = () => {

  return  (
    <>
     <MetaTags>
            <title>Marcin Kaciuba | mkaciuba.pl</title>
            <meta name="description" content="Marcin Kaciuba blog" />
          </MetaTags>
    <Header/>
    <Posts></Posts>
    <Footer></Footer>
    </>
  )
}

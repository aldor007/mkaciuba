
import { Footer } from '../components/Footer';
import { Posts, POST_TYPE } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading } from '@mkaciuba/ui-kit';
import { Helmet } from 'react-helmet-async';
import { PostNavbar } from '../components/PostNavbar';

export const Home = () => {

  return  (
    <>
     <Helmet>
            <title>Marcin Kaciuba | mkaciuba.pl</title>
            <meta name="description" content="Marcin Kaciuba blog" />
          </Helmet>
    <PostNavbar />
    <Posts type={POST_TYPE.ALL}></Posts>
    <Footer></Footer>
    </>
  )
}

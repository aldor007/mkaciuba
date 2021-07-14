
import { Footer } from '../components/Footer';
import { Posts } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading } from '@mkaciuba/ui-kit';

export const Home = () => {

  return  (
    <>
    <Header/>
    <Posts></Posts>
    <Footer></Footer>
    </>
  )
}

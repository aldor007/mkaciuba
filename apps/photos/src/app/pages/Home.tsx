
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading } from '@mkaciuba/ui-kit';

export const Home = () => {

  return  (
    <>
    <Header/>
    <Loading/>
    <Footer></Footer>
    </>
  )
}

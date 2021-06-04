import  { LoginForm } from '../components/LoginForm'
import { Footer } from '../components/Footer';
import React from 'react';
import  Header from '../Header';
import { generatePath, useParams } from 'react-router-dom';
import { AppRoutes } from '../routes';
import useToken from '../useToken';

function parseQuery<T>(queryString: string) {
    const query: T = {} as T;
    const pairs = queryString.substr(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

export const Login = () => {
  const {gallery, category} = parseQuery<{gallery: string, category: string}>(location.search)
  return  (
    <>
    <Header/>
    <LoginForm categorySlug={category} gallerySlug={gallery} />
    <Footer></Footer>
    </>)
}
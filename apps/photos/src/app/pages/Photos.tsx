
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { generatePath, useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';
import { gql, useQuery } from '@apollo/client';
import  { LoginForm } from '../components/LoginForm'
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';

const GET_PHOTOS = gql`
  query ($categorySlug: String!, $gallerySlug: String!) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    public
    keywords

  }
  galleryMenu(
    slug: $gallerySlug
  ) {
    gallery {
      id
      name
      slug
      keywords
      description
    }
    categories {
      slug
      name
    }
  }
}
`;


export const Photos = () => {
  const { categorySlug, gallerySlug } = useParams();
  const [loggedIn, setLogin] = React.useState(false);

  const { loading, error, data } = useQuery<Query>(GET_PHOTOS, {
    variables: { categorySlug, gallerySlug},
  });
  if (loading) return <p>Loading...</p>;

  if (error && (error as any).extensions && (error as any).extensions.code != 'UNAUTHENTICATED') {
     return <p>Error :(</p>
   };
  if (!data || !data.categoryBySlug || !data.galleryMenu) {
    return <p>Not found</p>
  }
  let authRequired = error ||  !loggedIn && data && !data.categoryBySlug.public
  if (!error) {
    authRequired = false;
  }

  if (loggedIn) {
    authRequired = false;
  }
  const { categories, gallery } = data.galleryMenu;
  const children  = categories.map((item) => {
    return {
     url: generatePath(AppRoutes.photos.path, {
       gallerySlug,
       categorySlug: item.slug
     }),
     name: item.name
    }
 })
 const menu = [{
   name: gallery.name,
   url: '#',
   children,
 }]

  return  (
    <>
    <Header mainMenu={menu}/>
    { !authRequired  && <ImageList categorySlug={categorySlug}/> }
    { authRequired  && <LoginForm categorySlug={categorySlug} gallerySlug={gallerySlug}   onSuccess={() => {
     setLogin(true)
    }} /> }

    <Footer></Footer>
    </>
  )
}

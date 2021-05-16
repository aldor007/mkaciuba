
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { generatePath, useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';
import { gql, useQuery } from '@apollo/client';
import  { LoginForm } from '../components/LoginForm'
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';

const GET_CATEGORY = gql`
  query categoryBySlug($categorySlug: String!) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    public
    keywords

  }
}
`;

const GET_GALLERY = gql`
query  galleryMenu($gallerySlug: String!) {
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
}`;

export const Photos = () => {
  const { categorySlug, gallerySlug } = useParams();
  const [loggedIn, setLogin] = React.useState(false);

  const { loading, error , data } = useQuery<Query>(GET_CATEGORY, {
    variables: { categorySlug},
  });
  const { data:galleryData, loading: loadingGallery } = useQuery(GET_GALLERY, {
    variables: { gallerySlug },
  });
  if (loading || loadingGallery) return <p>Loading...</p>;

  if (error && (error as any).extensions && (error as any).extensions.code != 'UNAUTHENTICATED') {
     return <p>Error :(</p>
   };
  let authRequired = error ||  !loggedIn && data && !data.categoryBySlug.public
  if (!error) {
    authRequired = false;
  }

  if (loggedIn) {
    authRequired = false;
  }
  const { categories, gallery } = galleryData.galleryMenu;
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

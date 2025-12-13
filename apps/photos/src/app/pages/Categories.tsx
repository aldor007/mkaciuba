
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { generatePath, useParams } from 'react-router-dom';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage, useSSRSafeQuery } from "@mkaciuba/ui-kit";

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


export const Categories = () => {
  const { gallerySlug } = useParams<{gallerySlug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_GALLERY, {
    variables: { gallerySlug },
  });
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  if (error) {
    console.error('Categories', error)
    return <ErrorPage code={500} message={error.message} />
   };

  if (shouldShowLoading || !data?.galleryMenu) return <Loading/>;

  const { gallery, categories } = data.galleryMenu;
  if (!gallery) {
    return <ErrorPage code={404} message={'Gallery no found'} />
  }

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
    <CategoriesList gallery={gallery}></CategoriesList>
    <Footer></Footer>
    </>
  )
}

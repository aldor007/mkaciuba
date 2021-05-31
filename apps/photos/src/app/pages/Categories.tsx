
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { generatePath, useParams } from 'react-router-dom';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading } from "@mkaciuba/ui-kit";

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
  if (loading) return <Loading/>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
  const { gallery, categories } = data.galleryMenu;
  if (!gallery) {
    return <p>Not found</p>
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


import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { PostCategory } from './PostCategory';
import { PostNavbar } from '../components/PostNavbar';

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


export const Page = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_GALLERY, {
    variables: { slug },
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Page', error)
    return <ErrorPage code={500} message={error.message} />
   };
  const { gallery, categories } = data.galleryMenu;
  if (!gallery) {
    return <ErrorPage code={404} message={'Gallery no found'} />
  }

  return  (
    <>
    <PostNavbar />
    <>
    </>
    <Footer></Footer>
    </>
  )
}

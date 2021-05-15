
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';
import { gql, useQuery } from '@apollo/client';

const GET_CATEGORY = gql`
query  ca($gallerySlug: String!) {
  galleries(where: {
    slug: $gallerySlug
  }) {
    id
    name
    slug
    keywords
    description
  }
}`;

export const Photos = () => {
  const { categorySlug } = useParams();
  return  (
    <>
    <Header/>
    <ImageList categorySlug={categorySlug}/>
    <Footer></Footer>
    </>
  )
}

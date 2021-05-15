
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../components/Footer';
import { faFacebook, faGithub, faInstagram, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';

const GET_GALLERY = gql`
query  galleries($gallerySlug: String!) {
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


export const Categories = () => {
  const { gallerySlug } = useParams();
  const { loading, error, data } = useQuery(GET_GALLERY, {
    variables: { gallerySlug },
  });
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
  const galleries = data.galleries;
  if (galleries.length  == 0) {
    return <p>Not found</p>
  }
  return  (
    <>
    <Header/>
    <CategoriesList gallery={galleries[0]}></CategoriesList>
    <Footer></Footer>
    </>
  )
}

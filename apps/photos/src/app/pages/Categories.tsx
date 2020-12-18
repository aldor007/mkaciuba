
import { CategoriesList } from '../components/CategoriesList';
import { Footer } from '../Footer';
import { faFacebook, faGithub, faInstagram, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';

const header = {
  brand: {
    imageUrl: 'https://aaa/[;',
    name: 'mkaciuba.pl'
  },
  mainMenu: [
    {
      name: 'Home',
      url: '/'
    }
  ],
  social: [
    {
      url: 'https://github.com/aldor007',
      icon: faGithub
    },
    {
      url: 'https://twitter.com/mkaciubapl',
      icon: faTwitter
    },
    {
      url: 'https://facebook.com/mkaciubapl',
      icon: faFacebook
    },
    {
      url: 'https://instagram.com/mkaciubapl',
      icon: faInstagram
    }
  ],
  topMenu: [
    {
      name: 'Home',
      url: '/'
    }
  ]
}

const GET_GALLERY = gql`
query  galleries($gallerySlug: String!) {
  galleries(where: {
    slug: $gallerySlug
  }) {
    id
    name
    slug
  }
}
`;
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
    <Header brand={header.brand} mainMenu={header.mainMenu} social={header.social} topMenu={header.topMenu}/>
    <CategoriesList galleryId={galleries[0].id} gallerySlug={galleries[0].slug}></CategoriesList>
    <Footer></Footer>
    </>
  )
}

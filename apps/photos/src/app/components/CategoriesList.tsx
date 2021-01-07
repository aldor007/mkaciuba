import React from "react";
import Masonry from "./Masonry";
import Card from "./Card";
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { RoutesMap } from '../../routes';


const GET_CATEGORIES = gql`
  query categories($galleryId: String!) {
  categories (where: {
    gallery: $galleryId
  }) {
    id
    slug
    image {
      url
     thumbnails {
        url
        mediaQuery
        webp
        type
      }
      defaultImage {
        url
        mediaQuery
        webp
        type
       }
      }
     name


  }
}
`;

export interface CategoriesListProps {
  galleryId: string
  gallerySlug: string
}

export const CategoriesList = ({ galleryId, gallerySlug}: CategoriesListProps) => {
  const { loading, error, data } = useQuery(GET_CATEGORIES, {
    variables: { galleryId },
  });
  console.info(loading, error, data)
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
    return (
  <Masonry>
    <div className="masonry px-16 py-8">

      {!loading && data.categories.map(item => (
        <div className="rounded-lg overflow-hidden mb-8" key={item.image.defaultImage}>
          <Link to={generatePath('/gallery/:gallerySlug/:categorySlug', {
            gallerySlug,
            categorySlug: item.slug,
          })}>
          <Card images={item.image.thumbnails} defaultImage={item.image.defaultImage} title={item.image.title} />
          </Link>
        </div>
      ))}
    </div>
  </Masonry>)
};

import React from "react";
import Masonry from "./Masonry";
import Card from "./Card";
import { gql, useQuery } from '@apollo/client';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowWidth
} from '@react-hook/window-size';
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'

import { Gallery, Item } from 'react-photoswipe-gallery'
const GET_IMAGES = gql`
  query categories($categorySlug: String!) {
  categories (where: {
    slug: $categorySlug
  }) {
    id
    image {
      url
    }
    name
    medias {
      id
     alternativeText
     thumbnails {
        url
        mediaQuery
        webp
        type
        width
        height
      }
      defaultImage {
        url
        mediaQuery
        webp
        type
        width
        height
      }
    }

  }
}
`;

export interface ImageListProps {
  categorySlug: number
}

export const ImageList = ({ categorySlug }: ImageListProps) => {

  const { loading, error, data } = useQuery(GET_IMAGES, {
    variables: { categorySlug },
  });
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
   if (data.categories.length === 0 ) {
     return <p> Not found </p>
   }
   const images = data.categories[0].medias;
    return (
      <Masonry>
            <div className="flex flex-wrap -mx-1 overflow-hidden">

  <Gallery shareButton={false}>
      {images.map(item => (
      <Item
        original={item.defaultImage.url}
        thumbnail={item.url}
        width={item.defaultImage.width}
        height={item.defaultImage.height}
        id={item.id}
        key={item.id}
      >
        {({ ref, open }) => (
<div className="my-1 px-1 w-1/2 overflow-hidden sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/3">
  <picture>
   {item.thumbnails.map(thumbnail => (
    <source srcSet={thumbnail.url} key={thumbnail.url}  media={thumbnail.mediaQuery} type={thumbnail.type}/>
  ))}
     <img ref={ref}  width={item.defaultImage.width} height={item.defaultImage.height} onClick={open} src={item.defaultImage.url} />
  </picture>
  <div className="overlay absolute bottom-0 w-full h-24 px-4 pt-6">
    <div className="text-white text-lg">{item.alternativeText}</div>
  </div>
</div>
        )}
      </Item>
      ))}
  </Gallery>
</div>
  </Masonry>
  )
};

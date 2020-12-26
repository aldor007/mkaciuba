import React from "react";
import Masonry from "./Masonry";
import Card from "./Card";
import { gql, useQuery } from '@apollo/client';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowWidth
} from '@react-hook/window-size';
// import 'photoswipe/dist/photoswipe.css'
// import 'photoswipe/dist/default-skin/default-skin.css'

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
         <style jsx>{`
      @screen md {
        .masonry {
          column-count: 2;
        }
      }
      .masonry {
        column-count: 3;
        column-gap: 2rem;
      }
      @screen lg {
        .masonry {
          column-count: 4;
        }
      }
    `}</style>
            <div className="masonry px-16 py-8">

  <Gallery shareButton={false}>
      {images.map(item => (
      <Item
        original={item.defaultImage.url}
        thumbnail={item.url}
        width={item.defaultImage.width}
        height={item.defaultImage.height}
        id={item.id}
      >
        {({ ref, open }) => (
<div className="relative cursor-pointer">
  <picture>
   {item.thumbnails.map(thumbnail=> (
    <source srcSet={thumbnail.url} media={thumbnail.mediaQuery} type={thumbnail.type}/>
  ))}
     <img ref={ref}  width={item.defaultImage.width} height={item.defaultImage.height} onClick={open} src={item.defaultImage.url} />
  </picture>
  <style>{`
    .overlay {
      background: linear-gradient(0deg, black, transparent);
    }
  `}</style>
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

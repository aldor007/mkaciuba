import React from "react";
import Masonry from "./Masonry";
import Card from "./Card";
import { gql, useQuery } from '@apollo/client';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowHeight,
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
    }
  }
}
`;

export interface ImageListProps {
  categorySlug: string
}

export interface Image {
  url: string
  mediaQuery: string 
  webp: boolean
  type: string
  width: number
  height: number
}

const findImageForWidth = (images: Image[], width: number, webp: boolean) => {
  const filterPresets = images.filter(p => {
    if (p.webp == webp) {
      return p;
    }
  });
  let minIndex = 0;
  let minValue = width - filterPresets[0].width;
  filterPresets.forEach((p, index) => {
    const tmpValue = width - p.width;
    if (tmpValue > 0 && tmpValue < minValue) {
      minIndex = index;
      minValue = tmpValue;
    }
  });

  return filterPresets[minIndex];
}

export const ImageList = ({ categorySlug }: ImageListProps) => {
  const webp = useWebPSupportCheck();
  const width = useWindowWidth({wait: 553});
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
   const defaultImages = images.map((item) => findImageForWidth(item.thumbnails, width, webp));
   return (
        <div className="flex flex-wrap -mx-1 overflow-hidden">
          <Gallery shareButton={false}>
            {images.map( (item, index) => (
            <Item
              original={defaultImages[index].url}
              thumbnail={defaultImages[index].url}
              width={defaultImages[index].width}
              height={defaultImages[index].height}
              id={item.id}
              key={item.id}
            >
            {({ ref, open }) => (
              <div className="my-1 px-1 w-1/2 overflow-hidden sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/3">
                <picture>
                  {item.thumbnails.map(thumbnail => (
                   <source srcSet={thumbnail.url} key={thumbnail.url}  media={thumbnail.mediaQuery} type={thumbnail.type}/>
                  ))}
                <img ref={ref}  width={defaultImages[index].url} height={defaultImages[index].height} onClick={open} src={defaultImages[index].url} />
                </picture>
                 <div className="my-1 px-1 w-1/2 overflow-hidden sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/3">
                  <div className="text-white text-lg">{item.alternativeText}</div>
                </div>
              </div>
            )}
      </Item>
      ))}
  </Gallery>
</div>
  )
};

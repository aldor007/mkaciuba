import React, { RefObject, useCallback, useState } from "react";
import { gql, useQuery } from '@apollo/client';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowWidth
} from '@react-hook/window-size';
// import 'photoswipe/dist/photoswipe.css'
// import 'photoswipe/dist/default-skin/default-skin.css'
import MetaTags from 'react-meta-tags';
import { Query } from '@mkaciuba/api';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Loading, LoadingMore, ErrorPage } from '@mkaciuba/ui-kit'


import { Image, ImageComponent } from './image';

import { Gallery, Item } from 'react-photoswipe-gallery'


const GET_IMAGES = gql`
  query categoryBySlug($categorySlug: String!, $start: Int!, $limit: Int) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    slug
    keywords
    mediasCount
    image {
     thumbnails {
        url
        mediaQuery
        webp
        type
        width
        height
     }
    }
    medias(start: $start, limit: $limit, sort: "id:desc") {
     id
     alternativeText
     caption
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
  minSize?: boolean
}


export const findImageForWidth = (images: Image[], width: number, webp: boolean) => {
  const filterPresets = images.filter(p => {
    if (p.webp == webp) {
      return p;
    }
  });
  let minIndex = 0;
  let minValue = Math.abs(width - filterPresets[0].width);
  filterPresets.forEach((p, index) => {
    const tmpValue = Math.abs(width - p.width);
    if (tmpValue < minValue) {
      minIndex = index;
      minValue = tmpValue;
    }
  });

  return filterPresets[minIndex];
}

export const ImageList = ({ categorySlug, minSize }: ImageListProps) => {
  const webp = useWebPSupportCheck();
  const width = useWindowWidth({
    initialWidth: 1000
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 12;
  const [start, setStart] = useState(limit)
  const { loading, error, data, fetchMore } = useQuery<Query>(GET_IMAGES, {
    variables: { categorySlug, limit, start: 0 },
    notifyOnNetworkStatusChange: true,

  });

  const hasNextPage = () => {
    if (!data) {
      return true;
    }

    if (data.categoryBySlug.medias.length < limit) {
      return false;
    }

    if (data.categoryBySlug.medias.length == data.categoryBySlug.mediasCount) {
      return false;
    }


    return true;
  }

  const handleLoadMore = useCallback(
    () => {
      setStart(start + limit)
    fetchMore({
      variables: {
         start,
         limit
      }});
    }, [fetchMore, start, limit]);

  const  [sentryRef, { rootRef }]  = useInfiniteScroll({
    loading: loadingMore,
    hasNextPage: hasNextPage(),
    onLoadMore: handleLoadMore,
    delayInMs: 250,
  });

  if (error) {
    console.error(error)
    return (<ErrorPage code={500} message={error.message}/>)
   };

  if (loading && !data) {
   return (
     <Loading/>
   );
  }


   if (!data || !data.categoryBySlug) {
     return <p> Not found </p>
   }
   const images = data.categoryBySlug.medias ;
   const category = data.categoryBySlug;
   const defaultImages = images.map((item) => findImageForWidth(item.thumbnails, width, webp));
   let seoImage = defaultImages;
   if (category.image) {
    seoImage = images.map((item) => findImageForWidth(category.image.thumbnails, 1024, false));
   }

   let imageClass = "mx-auto my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/4"
   if (minSize) {
    imageClass = "mx-auto my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:1/1 lg:w-1/2"
   }
   return (
     <>
        <div className="flex flex-wrap -mx-1 overflow-hidden" >
          <MetaTags>
            <meta name="twitter:image" content={seoImage[0].url} />
            <meta property="og:image" content={seoImage[0].url} />
          </MetaTags>
          <Gallery shareButton={false} id={category.slug}>
            {images.map( (item, index) => (
            <Item
              original={defaultImages[index].url}
              thumbnail={defaultImages[index].url}
              width={defaultImages[index].width}
              height={defaultImages[index].height}
              id={item.id}
              key={item.id}
              title={item.caption}
            >
            {({ ref, open }) => (
                <div className={imageClass}>
               <ImageComponent ref={ref as RefObject<HTMLImageElement>} onClick={open} thumbnails={item.thumbnails} defaultImage={defaultImages[index]} />
                  <div className="hidden overflow-hidden">
                    <div className="text-white text-lg">{item.alternativeText}</div>
                  </div>
                </div>
            )}
      </Item>
      ))}
      </Gallery>
</div>

    <div className="loader">
    {(( loading && hasNextPage()) && <LoadingMore /> )}
      {( hasNextPage()) && (
          <div ref={sentryRef}>
          </div>
        )}
    </div>
      </>
  )
};

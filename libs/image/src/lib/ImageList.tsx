import React, { RefObject, useCallback, useState} from "react";
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
import ReactGA from 'react-ga'


import { Image, ImageComponent } from './image';

import { Gallery, Item } from 'react-photoswipe-gallery'
import { findImageForWidthBigger } from "..";


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
     name
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
  if (!images) {
    return null;
  }

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
  const width = typeof document === 'undefined' ? 1900 :  document.documentElement.clientWidth

  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 29;
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
    async () => {
     ReactGA.event({
      category: 'image-load-more',
      action: 'load',
      label: window.location.href,
    })
    setStart(start + limit)
    await fetchMore({
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
     <LoadingMore/>
   );
  }


   if (!data || !data.categoryBySlug) {
     return <p> Not found </p>
   }
   const images = data.categoryBySlug.medias ;
   const category = data.categoryBySlug;
   const defaultImages = images.map((item) => findImageForWidth(item.thumbnails, width, webp));
   const defaultImagesFull = images.map((item) => findImageForWidthBigger(item.thumbnails, width, webp));
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
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="og:image" content={seoImage[0].url} />
          </MetaTags>
          <Gallery shareButton={false} id={category.slug} onOpen={() => ReactGA.event({
          category: 'photoswipe',
          action: 'open',
          label: window.location.href,
          })}>
            {images.map( (item, index) => (
            <Item
              original={defaultImagesFull[index].url}
              thumbnail={defaultImagesFull[index].url}
              width={defaultImagesFull[index].width}
              height={defaultImagesFull[index].height}
              // id={item.id}

              key={item.id}
              title={item.caption || item.alternativeText || item.name}
            >
            {({ ref, open }) => (
                <div className={imageClass}>
               <ImageComponent ref={ref as RefObject<HTMLImageElement>} onClick={async () => {
                 if (hasNextPage()) {
                  await handleLoadMore()
                 }
                setTimeout(open, 50)
               }} thumbnails={item.thumbnails} defaultImage={defaultImagesFull[index]} alt={item.alternativeText || item.name} />
                  <div className="hidden overflow-hidden">
                    <div className="text-white text-lg">{item.alternativeText || item.name}</div>
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

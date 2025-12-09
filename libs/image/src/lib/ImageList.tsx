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
import ReactGA from 'react-ga4'


import { Image, ImageComponent } from './image';

import { Gallery, Item } from 'react-photoswipe-gallery'
import { findImageForWidthBigger } from "..";

// Extend Window interface to include Apollo SSR state
declare global {
  interface Window {
    __APOLLO_STATE__?: any;
  }
}


// Fragment for reusable thumbnail structure
const THUMBNAIL_FRAGMENT = gql`
  fragment ThumbnailFields on Thumbnail {
    url
    mediaQuery
    webp
    type
    width
    height
  }
`;

const GET_IMAGES = gql`
  ${THUMBNAIL_FRAGMENT}
  query categoryBySlug($categorySlug: String!, $start: Int!, $limit: Int, $includeImage: Boolean = false) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    slug
    keywords
    mediasCount
    image @include(if: $includeImage) {
     thumbnails {
        ...ThumbnailFields
     }
    }
    medias(start: $start, limit: $limit, sort: "id:desc") {
     id
     alternativeText
     name
     caption
     thumbnails {
        ...ThumbnailFields
      }
    }
  }
}
`;

export interface ImageListProps {
  categorySlug: string
  minSize?: boolean
  disableSEO?: boolean
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

function hasSSRData() {
  if (typeof window == 'undefined') {
    return false
  }

  if (window.__APOLLO_STATE__) {
    return true
  }

  return false
}

export const ImageList = ({ categorySlug, minSize, disableSEO }: ImageListProps) => {
  const webp = useWebPSupportCheck();
  const width = typeof document === 'undefined' ? 1900 :  document.documentElement.clientWidth

  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 30;
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
      category: 'photoswipe',
      action: 'load',
      label: window.location.href,
    })
    setStart(prevStart => prevStart + limit)
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
            { !disableSEO && <meta name="twitter:image" content={seoImage[0].url} /> }
            { !disableSEO && <meta name="twitter:card" content="summary_large_image" /> }
            { !disableSEO && <meta property="og:image" content={seoImage[0].url} /> }
          </MetaTags>
          <Gallery shareButton={false} id={category.slug} onOpen={() => {
            ReactGA.event({
          category: 'photoswipe',
          action: 'open',
          label: window.location.href,
          })}}>
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

    {(( loading && hasNextPage()) && <LoadingMore /> )}
      {( hasNextPage()) && (
          <div ref={sentryRef}>
          </div>
        )}
      </>
  )
};

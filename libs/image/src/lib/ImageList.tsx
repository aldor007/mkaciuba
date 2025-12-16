/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { RefObject, useCallback, useState, useMemo } from "react";
import { gql, useQuery } from '@apollo/client';
import { Helmet } from 'react-helmet-async';
import { Query } from '@mkaciuba/types';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { LoadingMore, ErrorPage, useSSRSafeQuery } from '@mkaciuba/ui-kit'
import ReactGA from 'react-ga4'
import { Image, ImageComponent, useWebPSupportStable, DefaultImgSizing, findImageForWidthClosestWithDPR } from './image';
import { Gallery, Item } from 'react-photoswipe-gallery'

// import 'photoswipe/dist/photoswipe.css'
// import 'photoswipe/dist/default-skin/default-skin.css'

// Extend Window interface to include Apollo SSR state
declare global {
  interface Window {
    __APOLLO_STATE__?: any;
    __INITIAL_VIEWPORT__?: number;
  }
}


// Fragment for reusable thumbnail structure
const THUMBNAIL_FRAGMENT = gql`
  fragment ThumbnailFields on Image {
    url
    mediaQuery
    webp
    type
    width
    height
  }
`;

export const GET_IMAGES = gql`
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

  const filterPresets = images.filter(p => p.webp === webp);
  if (filterPresets.length === 0) {
    return null;
  }

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

export const ImageList = ({ categorySlug, minSize, disableSEO }: ImageListProps) => {
  const webp = useWebPSupportStable();
  // Use SSR-detected viewport from server-side device detection
  // This ensures mobile devices get appropriately-sized images on first load
  // Falls back to 1900 for desktop/unknown devices
  const initialWidth = typeof window !== 'undefined' && window.__INITIAL_VIEWPORT__
    ? window.__INITIAL_VIEWPORT__
    : 1900;

  // Detect device pixel ratio for retina displays
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const [loadingMore] = useState(false);
  const limit = 30;
  const [start, setStart] = useState(limit)
  const { loading, error, data, fetchMore } = useQuery<Query>(GET_IMAGES, {
    variables: { categorySlug, limit, start: 0 },
    notifyOnNetworkStatusChange: true,

  });
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  const hasNextPage = () => {
    if (!data) {
      return true;
    }

    if (data.categoryBySlug.medias.length < limit) {
      return false;
    }

    if (data.categoryBySlug.medias.length === data.categoryBySlug.mediasCount) {
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

  const  [sentryRef]  = useInfiniteScroll({
    loading: loadingMore,
    hasNextPage: hasNextPage(),
    onLoadMore: handleLoadMore,
    delayInMs: 250,
  });

  // Memoize image calculations - must be called before any early returns
  const images = useMemo(() => data?.categoryBySlug?.medias || [], [data?.categoryBySlug?.medias]);
  const category = data?.categoryBySlug;
  // For SEO meta tags, calculate a default image at 1024px using DPR-aware algorithm
  const defaultImages = useMemo(() =>
    images.map((item) => findImageForWidthClosestWithDPR(item.thumbnails, 1024, webp, 1)),
    [images, webp]
  );

  if (error) {
    console.error(error)
    return (<ErrorPage code={500} message={error.message}/>)
   };

  if (shouldShowLoading) {
    return <LoadingMore/>;
  }

  if (!data?.categoryBySlug) {
    return <p> Not found </p>
  }
   let seoImage = defaultImages;
   if (category.image) {
    seoImage = images.map((item) => findImageForWidthClosestWithDPR(category.image.thumbnails, 1024, false, 1));
   }

   let imageClass = "mx-auto my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/4"
   if (minSize) {
    imageClass = "mx-auto my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:1/1 lg:w-1/2"
   }
   return (
     <>
        <div className="flex flex-wrap -mx-1 overflow-hidden" >
          <Helmet>
            { !disableSEO && <meta name="twitter:image" content={seoImage[0].url} /> }
            { !disableSEO && <meta name="twitter:card" content="summary_large_image" /> }
            { !disableSEO && <meta property="og:image" content={seoImage[0].url} /> }
          </Helmet>
          {/* @ts-expect-error - react-photoswipe-gallery types not fully compatible with React 18 */}
          <Gallery shareButton={false} id={category.slug} onOpen={() => {
            ReactGA.event({
          category: 'photoswipe',
          action: 'open',
          label: window.location.href,
          })}}>
            {images.map( (item, index) => {
              // Calculate large image for photoswipe lightbox using DPR-aware algorithm
              const lightboxImage = findImageForWidthClosestWithDPR(item.thumbnails, 1900, webp, dpr);
              return (
            <Item
              original={lightboxImage.url}
              thumbnail={lightboxImage.url}
              width={lightboxImage.width}
              height={lightboxImage.height}
              key={item.id}
              title={item.caption || item.alternativeText || item.name}
            >
            {({ ref, open }) => (
                <div className={imageClass}>
               <ImageComponent
                 ref={ref as RefObject<HTMLImageElement>}
                 onClick={async () => {
                   if (hasNextPage()) {
                     await handleLoadMore()
                   }
                   setTimeout(open, 50)
                 }}
                 thumbnails={item.thumbnails}
                 alt={item.alternativeText || item.name}
                 initialWidth={initialWidth}
                 defaultImgSizing={DefaultImgSizing.BIGGER}
               />
                  <div className="hidden overflow-hidden">
                    <div className="text-white text-lg">{item.alternativeText || item.name}</div>
                  </div>
                </div>
            )}
      </Item>
              )}
      )}
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

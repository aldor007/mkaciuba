import React, { RefObject, useCallback, useState  } from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';

import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { findImageForWidth, ImageComponent } from "@mkaciuba/image";
import { useWebPSupportCheck } from "react-use-webp-support-check";
import MetaTags from 'react-meta-tags';
import { Gallery, Query } from '@mkaciuba/api';
import '../../assets/category.css';

import {
  useWindowWidth
} from '@react-hook/window-size';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { AppRoutes } from "../routes";
import { ErrorPage, Loading, LoadingMore } from "@mkaciuba/ui-kit";


const GET_CATEGORIES = gql`
  query categories($galleryId: String!, $start: Int, $limit: Int) {
  categories (where: {
    gallery: $galleryId
  }, limit: $limit, start: $start, sort:"id:desc") {
    name
    id
    slug
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
 }
  categoriesCount(where: {
    gallery: $galleryId
  })
}
`;
export interface CategoriesListProps {
  gallery: Gallery
}

export const CategoriesList = ({ gallery}: CategoriesListProps) => {
  const webp = useWebPSupportCheck();
  const width = useWindowWidth();
  const [loadingMore, setLoadingMore] = useState(false);
  const [start, setStart] = useState(0)
  const limit = 9
  const {loading, error, data, fetchMore } = useQuery<Query>(GET_CATEGORIES, {
    variables: { galleryId: gallery.id, start: 0, limit},
    notifyOnNetworkStatusChange: true
  });

  const hasNextPage = () => {
    if (!data) {
      return true;
    }

    if (data.categories.length < limit) {
      return false;
    }

    if (data.categories.length == data.categoriesCount) {
      return false;
    }

    return true;
  }

  const handleLoadMore = useCallback(() => {
    setStart(start + limit)
    fetchMore({
      variables: {
         start,
         limit
      }});
    }, [fetchMore, start, limit ]);

  const [sentryRef ]= useInfiniteScroll({
    loading: loadingMore,
    hasNextPage: hasNextPage(),
    onLoadMore: handleLoadMore,
    delayInMs: 250,
  })

  if (error) {
    console.error('CategoriesList', error)
    return <ErrorPage code={500} message={error.message} />
   };

   if (loading && !data) {
    return (
      <Loading/>
    );
  }
  const { categories } =  data;
  // setStart(stagccrt + limit)
  const defaultImages = categories.reduce((acc, cur) => {
    if (!cur.image) {
      acc[cur.id] = null;
      return acc;
    }
    acc[cur.id] = findImageForWidth(cur.image.thumbnails, width, webp)
    return acc;
  }, {})
    return (
      <>
     <div className="flex flex-wrap -mx-1 overflow-hidden">
       <MetaTags>
            <title>{gallery.name}</title>
            <meta name="description" content={gallery.description} />
            <meta property="og:title" content={gallery.name} />
          </MetaTags>
      {categories && categories.map(item => (
         <div className="my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:w-1/2 lg:w-1/2 xl:w-1/3" key={item.slug}>
          <Link to={generatePath(AppRoutes.photos.path, {
            gallerySlug: gallery.slug,
            categorySlug: item.slug,
          })}>
              { !item.image &&   <div className="bg-gray-700" ></div>  }
              { item.image &&   <ImageComponent thumbnails={item.image.thumbnails} defaultImage={defaultImages[item.id]} />  }
              <div className="category-heading">
               <h2>{item.name}</h2>
              </div>
          </Link>
        </div>
      ))}
    </div>
    <div className="loader">
    {((loadingMore || loading) && <LoadingMore /> )}
      {( hasNextPage()) && (
          <div ref={sentryRef}>
          </div>
        )}
    </div>
    </>
  )
};

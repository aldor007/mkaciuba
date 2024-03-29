import React, { RefObject, useCallback, useState  } from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';

import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { findImageForWidth, ImageComponent } from "@mkaciuba/image";
import MetaTags from 'react-meta-tags';
import { Gallery, Query } from '@mkaciuba/api';
import {useHistory} from "react-router-dom"
import '../../assets/category.css';

import {
  useWindowWidth
} from '@react-hook/window-size';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { AppRoutes } from "../routes";
import { ErrorPage, Loading, LoadingMore, useQueryParams } from "@mkaciuba/ui-kit";


const GET_CATEGORIES = gql`
  query categories($galleryId: String!, $start: Int, $limit: Int) {
  categories (where: {
    gallery: $galleryId
  }, limit: $limit, start: $start, sort:"id:desc") {
    name
    id
    slug
    image {
     id
     matchingThumbnails(preset: "categorylist") {
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
  const webp = false;// useWebPSupportCheck();
  const width = useWindowWidth();
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;
  const history = useHistory();
  const [start, setStart] = useState(limit);

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

    if (data.categoriesCount - start + limit <= 0) {
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
    delayInMs: 450,
  })

  if (error) {
    console.error('CategoriesList', error)
    return <ErrorPage code={500} message={error.message} />
   };

   // first loader
   // laoding = true and data null
   if (loading && !data) {
    return (
      <Loading/>
    );
  }


  const { categories } =  data;
  // setStart(stagccrt + limit)
  const defaultImages = categories.reduce((acc, cur) => {
    if (!cur.image ) {
      acc[cur.id] = null;
      return acc;
    }

    acc[cur.id] = findImageForWidth(cur.image.matchingThumbnails, width, webp)
    return acc;
  }, {})
    return (
      <>
     <div className="flex flex-wrap mx-auto overflow-hidden">
       <MetaTags>
            <title>{gallery.name} | mkaciuba.pl</title>
            <meta name="description" content={gallery.description} />
            <meta property="og:title" content={gallery.name} />
          </MetaTags>
      {categories && categories.map(item => (
         <div className="mx-auto my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:w-1/2 lg:w-1/2 xl:w-1/2" key={item.slug}>
          <Link to={generatePath(AppRoutes.photos.path, {
            gallerySlug: gallery.slug,
            categorySlug: item.slug,
          })}>
              { !item.image &&   <img src="https://mort.mkaciuba.com/images/files/placeholder.jpg"/>  }
              { item.image &&   <ImageComponent thumbnails={item.image.matchingThumbnails} defaultImage={defaultImages[item.id]} />  }
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

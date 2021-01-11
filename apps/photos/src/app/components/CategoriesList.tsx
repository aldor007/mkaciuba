import React, { RefObject, useState  } from "react";
import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { RoutesMap } from '../../routes';
import { findImageForWidth, ImageComponent } from "@mkaciuba/image";
import { useWebPSupportCheck } from "react-use-webp-support-check";
import LazyLoad from 'react-lazyload';
import {
  useWindowWidth
} from '@react-hook/window-size';
import useInfiniteScroll from 'react-infinite-scroll-hook';


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
}
`;

export interface CategoriesListProps {
  galleryId: string
  gallerySlug: string
}

export const CategoriesList = ({ galleryId, gallerySlug}: CategoriesListProps) => {
  const webp = useWebPSupportCheck();
  const width = useWindowWidth();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [start, setStart] = useState(9)
  const limit = 9
  const {loading, error, data, fetchMore } = useQuery(GET_CATEGORIES, {
    variables: { galleryId, start: 0, limit},
  });
  const [items, setItems] = useState([]);

  function handleLoadMore() {
    setLoadingMore(true);
    fetchMore({
      variables: {
         start: start,
      },
    }).then((fetchMoreResult) => {
      setLoadingMore(false);
      setStart(start + limit);
      setItems([...items, ...fetchMoreResult.data.categories]);
      setHasNextPage(fetchMoreResult.data.categories.length != 0)
    });
  }

  const infiniteRef = useInfiniteScroll({
    loading: loadingMore,
    hasNextPage,
    onLoadMore: handleLoadMore,
    // threshold: 250,
  }) as RefObject<HTMLDivElement>;

  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };

   if (loading) {
    return (
      <div className="flex justify-center">
      <div className="loader center ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
      </div>
    );
  }
  const categories = [...data.categories, ...items] ;
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
     <div className="flex flex-wrap -mx-1 overflow-hidden" ref={infiniteRef}>

      {!loading && categories.map(item => (
         <div className="my-1 px-1 w-1/1 overflow-hidden sm:w-1/1 md:w-1/2 lg:w-1/2 xl:w-1/3" key={item.slug}>
          <Link to={generatePath('/gallery/:gallerySlug/:categorySlug', {
            gallerySlug,
            categorySlug: item.slug,
          })}>
              { item.image &&   <ImageComponent thumbnails={item.image.thumbnails} defaultImage={defaultImages[item.id]} />
               }
          </Link>
        </div>
      ))}
    </div>
  )
};

import React, { RefObject, useCallback, useState } from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import {useNavigate} from "react-router-dom"
import { Link } from 'react-router-dom'
import { generatePath, useLocation } from "react-router";
import { findImageForWidth, ImageComponent, useWebPSupportStable } from "@mkaciuba/image";
import { Helmet } from 'react-helmet-async';
import { Gallery, Query, Post } from '@mkaciuba/api';
import {
  useWindowWidth
} from '@react-hook/window-size';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { AppRoutes } from "../routes";
import { ErrorPage, Loading, LoadingMore, useQueryParams, useSSRSafeQuery } from "@mkaciuba/ui-kit";
import { PostCard } from "./PostCard";
import '../../assets/category.css';


export const GET_POSTS = gql`
  query posts($start: Int, $limit: Int) {
  posts(limit: $limit, start: $start, sort:"id:desc") {
    title
    id
    publicationDate
    slug
    keywords
    category {
      name
      slug
    }
    mainImage {
      url
      mediaQuery
      webp
      type
      width
      height
    }
 }
 postsCount
}
`;
export const GET_POSTS_FROM_CAT = gql`
  query posts($start: Int, $limit: Int, $id: String) {
  posts(limit: $limit, start: $start, sort:"id:desc", where: {
    category: $id
  } ) {
    title
    id
    publicationDate
    slug
    keywords
    category {
      name
      slug
    }
    mainImage {
      url
      mediaQuery
      webp
      type
      width
      height
    }
 }
 postsCount(where: {
   category: $id
 })
}`

export const GET_POSTS_FROM_TAG = gql`
  query posts($start: Int, $limit: Int, $id: String) {
  posts(limit: $limit, start: $start, sort:"id:desc", where: {
    tags: $id
  } ) {
    title
    id
    publicationDate
    slug
    keywords
    category {
      name
      slug
    }
    mainImage {
      url
      mediaQuery
      webp
      type
      width
      height
    }
 }
 postsCount(where: {
   tag: $id
 })
}`

export enum POST_TYPE {
  ALL,
  CATGORY,
  TAG
}
export interface PostsProps {
  id?: string
  type: POST_TYPE

}

export const Posts = ( { id, type} : PostsProps) => {
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const webp = useWebPSupportStable();
  const width = 1800;
  const limit = 9;
  const [loadingMore, setLoadingMore] = useState(false);
  let page = queryParams.get('page');
  if (!page) {
    page = '1'
  }
  const startPage = (parseInt(page) - 1) * limit;


  const [start, setStart] = useState(parseInt(page) * limit)
  let query = GET_POSTS;
  if (type === POST_TYPE.CATGORY) {
    query = GET_POSTS_FROM_CAT
  } else if (type === POST_TYPE.TAG) {
    query = GET_POSTS_FROM_TAG
  }

  const {loading, error, data, fetchMore } = useQuery<Query>(query, {
    variables: {  start: startPage , limit, id},
    notifyOnNetworkStatusChange: true
  });
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  const hasNextPage = () => {
    if (!data) {
      return true;
    }

    if (data.posts.length < limit) {
      return false;
    }

    if (data.posts.length == data.postsCount) {
      return false;
    }

    return true;
  }

  const handleLoadMore = useCallback(() => {
    setStart(prevStart => {
      const newStart = prevStart + limit;
      navigate({
        pathname: window.location.pathname,
        search: '?page=' + Math.floor(newStart / limit)
      })
      return newStart;
    })
    fetchMore({
      variables: {
         start,
         limit
      }});
    }, [fetchMore, start, limit, navigate]);


  if (error) {
    console.error('Posts', error)
    return <ErrorPage code={500} message={error.message} />
   };

  if (shouldShowLoading) {
    return <LoadingMore/>;
  }

  const { posts } =  data!;
  const defaultImages = posts.reduce((acc, cur) => {
    if (!cur.image) {
      acc[cur.id] = null;
      return acc;
    }
    acc[cur.id] = findImageForWidth(cur.image.matchingThumbnails, width, webp)
    return acc;
  }, {})


  const singlePost = (item: Post, index) => {

    return (
      <PostCard post={item} inColumn={(index + 1) % 3 == 1} />
    )
  }
  // setStart(stagccrt + limit)
    return (
      <>
  <div className="max-w-screen-xl mx-auto grid xl:grid-cols-2  gap-4">
        {posts && posts.map((item, index) =>
          <div key={item.id}>{singlePost(item, index)}</div>
        )}
  </div>
  { hasNextPage() &&<div className="max-w-screen-xl w-full m-4 mx-auto text-center  " >
      <button onClick={handleLoadMore}  className="w-full mx-auto text-center border-4 font-medium	 px-5 py-3 rounded-xl text-sm font-medium text-gray-600 bg-white outline-none border border-gray-600 hover:bg-gray-600 hover:border-gray-800 hover:text-white transition-all">
        Załaduj więcej</button>
  </div> }
  </>
  )
};

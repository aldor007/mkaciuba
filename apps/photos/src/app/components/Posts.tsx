
import React, { RefObject, useCallback, useState  } from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';

import {useHistory} from "react-router-dom"
import { Link } from 'react-router-dom'
import { generatePath, useLocation } from "react-router";
import { findImageForWidth, ImageComponent } from "@mkaciuba/image";
import { useWebPSupportCheck } from "react-use-webp-support-check";
import MetaTags from 'react-meta-tags';
import { Gallery, Query, Post } from '@mkaciuba/api';
import '../../assets/category.css';

import {
  useWindowWidth
} from '@react-hook/window-size';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { AppRoutes } from "../routes";
import { ErrorPage, Loading, LoadingMore } from "@mkaciuba/ui-kit";
import { PostCard } from "./PostCard";


const GET_POSTS = gql`
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
const GET_POSTS_FROM_CAT = gql`
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

const GET_POSTS_FROM_TAG = gql`
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
  id?: String
  type: POST_TYPE

}

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export const Posts = ( { id, type} : PostsProps) => {
  const history = useHistory();
  const queryParams = useQueryParams();
  const webp = useWebPSupportCheck();
  const width = useWindowWidth();
  const limit = 6
  const [loadingMore, setLoadingMore] = useState(false);
  let page = queryParams.get('page');
  if (!page) {
    page = '1'
  }
  let startPage = (parseInt(queryParams.get('page')) - 1) * limit;


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
    setStart(start + limit)
    history.push({
      pathname: window.location.pathname,
      search: '?page=' + Math.floor((start + limit) / limit)
    })
    fetchMore({
      variables: {
         start,
         limit
      }});
    }, [fetchMore, start, limit ]);


  if (error) {
    console.error('Posts', error)
    return <ErrorPage code={500} message={error.message} />
   };

   if (loading && !data) {
    return (
      <Loading/>
    );
  }
  const { posts } =  data;
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
          singlePost(item, index)
        )}
  </div>
  { hasNextPage() &&<div className="max-w-screen-xl w-full m-4 mx-auto text-center  " >
      <button onClick={handleLoadMore}  className="w-full mx-auto text-center border-4  px-5 py-3 rounded-xl text-sm font-medium text-indigo-600 bg-white outline-none border border-indigo-600 hover:border-4 hover:border-indigo-800 hover:text-indigo-800 transition-all">
        Załaduj więcej</button>
  </div> }
  </>
  )
};

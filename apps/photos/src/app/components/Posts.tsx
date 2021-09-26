
import React, { RefObject, useCallback, useState  } from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';

import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
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
    image {
      matchingThumbnails(preset: "postlist") {
        url
        mediaQuery
        webp
        type
        width
        height
      }
    }
 }
 postsCount
}
`;
const GET_POSTS_FROM_CAT = gql`
  query posts($start: Int, $limit: Int, $categoryId: String) {
  posts(limit: $limit, start: $start, sort:"id:desc", where: {
    category: $categoryId
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
    image {
      matchingThumbnails(preset: "postlist") {
        url
        mediaQuery
        webp
        type
        width
        height
      }
    }
 }
 postsCount(where: {
   category: $categoryId
 })
}`

export interface PostsProps {
  categoryId?: String
}
export const Posts = ( { categoryId }: PostsProps) => {
  const webp = useWebPSupportCheck();
  const width = useWindowWidth();
  const [loadingMore, setLoadingMore] = useState(false);
  const [start, setStart] = useState(9)
  const limit = 6
  const {loading, error, data, fetchMore } = useQuery<Query>(categoryId ? GET_POSTS_FROM_CAT : GET_POSTS, {
    variables: {  start: 0, limit, categoryId},
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
  { hasNextPage() &&<div className="max-w-screen-xl m-4 mx-auto text-center  " >
      <button onClick={handleLoadMore}  className="max-w-screen-xl m-4 mx-auto text-center border-4  px-5 py-3 rounded-xl text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-4 focus:border-4 hover:border-indigo-800 hover:text-indigo-800 focus:border-purple-200 active:border-grey-900 active:text-grey-900 transition-all">
        <i className="mdi mdi-circle-outline mr-2 text-xl align-middle leading-none"></i>
        Załaduj więcej</button>
  </div> }
  </>
  )
};

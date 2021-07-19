
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
  const [start, setStart] = useState(0)
  const limit = 9
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

  const [sentryRef ]= useInfiniteScroll({
    loading: loadingMore,
    hasNextPage: hasNextPage(),
    onLoadMore: handleLoadMore,
    delayInMs: 250,
  })

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


  const singlePost = (item: Post , index) => {
    let headerClass ="relative  mx-auto max-w-screen-xl "
    if ((index + 1) % 3 == 1) {
      headerClass = "relative  mx-auto max-w-screen-xl lg:col-span-2 "
    }
    return (
      <div className={headerClass} key={`${item.title}-${item.id}`}>
        <div className="bg-cover bg-center z-0">
        <ImageComponent thumbnails={item.image.matchingThumbnails} defaultImage={defaultImages[item.id]} />
</div>
        <div className="absolute text-lg 	leading-snug font-serif inset-x-1/3	 bottom-32 z-10 h-16  justify-center items-center  text-white">
          <div className="container text-center  items-center mx-auto p-3">
            <div className="row">
              <Link to={generatePath(AppRoutes.post.path, {
                slug: item.slug,
              })}>
                <h1 className="font-black md:text-3xl sm:text-1xl text-4xl hover:underline	">{item.title}</h1>
               </Link>
            </div>
            <div className="row m-3">
              <span className="meta-date">
                {new Date(item.publicationDate).toLocaleDateString()}
                </span>
              <span className="mx-3">•</span>
              <span className="underline">
                <Link to={generatePath(AppRoutes.postcategory.path, {
                  slug: item.category.slug,
                })}>
                  {item.category.name}
                  </Link>
                  </span>
            </div>
				  </div>
				</div>
        </div>
    )
  }
  // setStart(stagccrt + limit)
    return (
  <div className="max-w-screen-xl mx-auto grid xl:grid-cols-2  gap-4">
        {posts && posts.map((item, index) =>
          singlePost(item, index)
        )}
  </div>
  )
};

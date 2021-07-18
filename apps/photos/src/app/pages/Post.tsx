
import { Footer } from '../components/Footer';
import { Posts } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag'
import { Query } from '@mkaciuba/api';
import { ImageComponent, ImageList } from '@mkaciuba/image';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { AppRoutes } from "../routes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';



const GET_POST = gql`
  query ($postSlug: String!) {
    postBySlug(slug: $postSlug) {
      id
      title
      publicationDate
      image {
        url
      }
      gallery {
        slug
      }
      category {
        name
        slug
      }
      description
      text
  }
  prevNextPost(slug: $postSlug) {
      id
      title
      slug
      image {
        matchingThumbnails(preset: "small") {
            url
            mediaQuery
            webp
            type
            width
            height
          }
      }
      gallery {
        slug
      }
      category {
        name
        slug
      }
  }

}
`;


export const Post = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_POST, {
    variables: { postSlug: slug},
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Post', error)
    return <ErrorPage code={500} message={error.message} />
   };

  const post = data.postBySlug;
  const [prevPost, nextPost] = data.prevNextPost;
  function onHover (e)  {

  }

  return  (
    <>
          <MetaTags>
            <title>{post.title}</title>
            <meta name="description" content={post.description} />
            <meta name="keywords" content={post.keywords} />
            <meta property="og:title" content={post.title} />
          </MetaTags>
    <Header/>
     <div className="fixed">
       <div className="left-0 m-4 cursor-pointer fixed top-1/2">
        <FontAwesomeIcon icon={faArrowLeft} size='1x' />

      </div>
      <div className="right-0 cursor-pointer  hover-trigger fixed top-1/2">
      <FontAwesomeIcon className="m-4 hover:hidden" icon={faArrowRight} size='1x' onMouseEnter={onHover} />
      <div className="hover-target">
        <div className="flex leading-snug font-serif">
          <div className="flex-cols m-2 font-bold	text-xl	">
            <h1 className="text-lg	text-gray-400	">Newer</h1>
            <h2 className="text-gray-600">{nextPost.title}</h2>
          </div>
          <div className="flex-cols">
          <ImageComponent thumbnails={nextPost.image.matchingThumbnails} defaultImage={nextPost.image.matchingThumbnails[0]}/>
          </div>
        </div>
      </div>
      </div>
      </div>
        <div className="text-lg  	leading-snug font-serif  justify-center items-center  text-black">
          <div className="container text-center  items-center mx-auto p-3">
            <div className="row">
            <h1 className="font-black text-lg 	leading-snug font-serif  md:text-3xl sm:text-1xl text-4xl text-center">{post.title}</h1>
            </div>
            <div className="row m-3">
              <span className="meta-date">
                {new Date(post.publicationDate).toLocaleDateString()}
                </span>
              <span className="mx-3">•</span>
              <span className="underline">
                <Link to={generatePath(AppRoutes.postcategory.path, {
                  slug: post.category.slug,
                })}>
                  {post.category.name}
                  </Link>
                  </span>
            <p>
            {post.description}
            </p>
            </div>
				  </div>
				</div>
    <div className="max-w-screen-xl mx-auto">
      <p>
      {post.text}
      </p>
      <ImageList categorySlug={post.gallery.slug} minSize={true} />
      </div>
      <>

      </>
    <Footer></Footer>
    </>
  )
}

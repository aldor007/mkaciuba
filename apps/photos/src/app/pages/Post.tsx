
import { Footer } from '../components/Footer';
import { Posts } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag'
import { Query } from '@mkaciuba/api';
import { ImageList } from '@mkaciuba/image';
import MetaTags from 'react-meta-tags';

const GET_POST = gql`
  query ($postSlug: String!) {
    postBySlug(slug: $postSlug) {
      id
      title
      image {
        url
      }
      gallery {
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

  return  (
    <>
          <MetaTags>
            <title>{post.title}</title>
            <meta name="description" content={post.description} />
            <meta name="keywords" content={post.keywords} />
            <meta property="og:title" content={post.title} />
          </MetaTags>
    <Header/>
    <div className="max-w-screen-xl mx-auto">
      <h1 className="font-black text-lg 	leading-snug font-serif  md:text-3xl sm:text-1xl text-4xl text-center">{post.title}</h1>
      <p>
      {post.description}
      </p>
      <ImageList categorySlug={post.gallery.slug} minSize={true} />
      </div>
    <Footer></Footer>
    </>
  )
}

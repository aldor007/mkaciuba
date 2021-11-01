
import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { Loading, ErrorPage, LoadingMore } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { PostCategory } from './PostCategory';
import { PostNavbar } from '../components/PostNavbar';
import ReactMarkdown from 'react-markdown';
import MetaTags from 'react-meta-tags';

const GET_GALLERY = gql`
query  pageBySlug($slug: String!) {
  pageBySlug(
    slug: $slug
  ) {
    title
    keywords
    slug
    content
  }

}`;


export const Page = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_GALLERY, {
    variables: { slug },
  });
  if (loading) return <LoadingMore/>;
  if (error) {
    console.error('Page', error)
    return <ErrorPage code={500} message={error.message} />
   };
  if (!data.pageBySlug) {
    return <ErrorPage code={404} message={'Page no found'} />
  }
  const { content } = data.pageBySlug;
  const page = data.pageBySlug;

  return  (
    <>
          <MetaTags>
            <title>{page.title}</title>
            <meta name="keywords" content={page.keywords} />
            <meta property="og:title" content={page.title} />
          </MetaTags>
    <PostNavbar />
        <div className="max-w-screen-xl mx-auto post-text prose">
          <ReactMarkdown className="m-4">
            {content}
            </ReactMarkdown>
      </div>
    <Footer></Footer>
    </>
  )
}


import { Footer } from '../components/Footer';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { PostCategory } from './PostCategory';
import { PostNavbar } from '../components/PostNavbar';
import marked from 'marked';

const GET_GALLERY = gql`
query  pageBySlug($slug: String!) {
  pageBySlug(
    slug: $slug
  ) {
    slug
    content
  }

}`;


export const Page = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_GALLERY, {
    variables: { slug },
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Page', error)
    return <ErrorPage code={500} message={error.message} />
   };
  if (!data.pageBySlug) {
    return <ErrorPage code={404} message={'Page no found'} />
  }
  const { content } = data.pageBySlug;

  return  (
    <>
    <PostNavbar />
        <div className="max-w-screen-xl mx-auto post-text">
                <p className="m-4" dangerouslySetInnerHTML={{
              __html: marked(content)
              }}/>
      </div>
    <Footer></Footer>
    </>
  )
}

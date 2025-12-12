import { Footer } from '../components/Footer';
import React from 'react';
import  Header from '../Header';
import { useQuery,  } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage, useSSRSafeQuery } from '@mkaciuba/ui-kit'
import { generatePath, useParams } from 'react-router-dom';
import { Posts, POST_TYPE } from '../components/Posts';
import { Helmet } from 'react-helmet-async';;

const GET_POST_CATEGORY = gql`
  query ($slug: String!) {
    tagBySlug(
    slug: $slug
  ) {
    id
    name
  }
}
`;
export const PostTag = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_POST_CATEGORY, {
    variables: { slug},
  });
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  if (error) {
    console.error('Tags ', error)
    return <ErrorPage code={500} message={error.message} />
   };

  if (shouldShowLoading) return <Loading/>;

  const tag = data!.tagBySlug;
  if (!tag) {
    return <ErrorPage code={404} message={'Tag no found'} />
  }

  return  (
    <>
          <Helmet>
            <title>Tag - {tag.name} | mkaciuba.pl</title>
          </Helmet>
    <Header/>
    <h1 className="text-center m-5 text-4xl leading-snug font-serif ">Posty z tagu: {tag.name}</h1>
    <Posts id={tag.id} type={POST_TYPE.TAG}/>
    <Footer></Footer>
    </>
  )
}

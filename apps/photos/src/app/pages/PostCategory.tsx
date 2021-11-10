import { Footer } from '../components/Footer';
import React from 'react';
import  Header from '../Header';
import { useQuery,  } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage } from '@mkaciuba/ui-kit'
import { generatePath, useParams } from 'react-router-dom';
import { Posts, POST_TYPE } from '../components/Posts';
import { PostNavbar } from '../components/PostNavbar';
import MetaTags from 'react-meta-tags';

const GET_POST_CATEGORY = gql`
  query ($slug: String!) {
  postCategoryBySlug(
    slug: $slug
  ) {
    id
    name
  }
}
`;
export const PostCategory = () => {
  const { slug } = useParams<{slug: string}>();
  const { loading, error, data } = useQuery<Query>(GET_POST_CATEGORY, {
    variables: { slug},
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Categories', error)
    return <ErrorPage code={500} message={error.message} />
   };
  const category = data.postCategoryBySlug;
  if (!category) {
    return <ErrorPage code={404} message={'Category no found'} />
  }

  return  (
    <>
          <MetaTags>
            <title>Kategoria - {category.name} | mkaciuba.pl</title>
          </MetaTags>
    <PostNavbar />
    <h1 className="text-center m-5 text-4xl leading-snug font-serif ">Posty z kategorii: {category.name}</h1>
    <Posts id={category.id} type={POST_TYPE.CATGORY}/>
    <Footer></Footer>
    </>
  )
}

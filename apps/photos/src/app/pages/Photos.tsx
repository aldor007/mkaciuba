
import { Footer } from '../components/Footer';
import React from 'react';
import  Header from '../Header';
import { generatePath, Redirect, useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';
import { ApolloError  } from '@apollo/client';
import { useQuery,  } from '@apollo/client/react';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage, LoadingMore } from '@mkaciuba/ui-kit'
import MetaTags from 'react-meta-tags';
import ReactMarkdown from 'react-markdown';

const GET_PHOTOS = gql`
  query ($categorySlug: String!, $gallerySlug: String!) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    public
    keywords

  }
  galleryMenu(
    slug: $gallerySlug
  ) {
    gallery {
      id
      name
      slug
      keywords
      description
    }
    categories {
      slug
      name
    }
  }
}
`;


export const Photos = () => {
  const { categorySlug, gallerySlug } = useParams<{gallerySlug: string, categorySlug: string}>();
  // const {token } = useToken()

  const { loading, error, data } = useQuery<Query>(GET_PHOTOS, {
    variables: { categorySlug, gallerySlug},
  });
  if (loading) return <LoadingMore/>;
  let authRequired = false;
  if (error && error.graphQLErrors.some(g => g.extensions?.code == 'UNAUTHENTICATED')) {
    authRequired = true;
  } else if (error && error.graphQLErrors.some(g => g.extensions?.code == 'FORBIDDEN')) {
    authRequired = true;
  } else if (error) {
    console.error('Photos', error)
    return (<ErrorPage code={500} message={error.message} />)
  }

  if (authRequired) {
    return  (
      <Redirect to={`${generatePath(AppRoutes.login.path)}?gallery=${gallerySlug}&category=${categorySlug}`} />
    )
  }

  const { categories, gallery } = data.galleryMenu;
  const category = data.categoryBySlug;
  const children  = categories.map((item) => {
    return {
     url: generatePath(AppRoutes.photos.path, {
       gallerySlug,
       categorySlug: item.slug
     }),
     name: item.name
    }
 })
 const menu = [
  {
   name: gallery.name,
   url: generatePath(AppRoutes.categoryList.path, {
     gallerySlug: gallery.slug
    }),

  },
  {
   name: 'Galerie',
   url: '#',
   children,
 }]

  return  (
    <>
          <MetaTags>
            <title>{category.name} | mkaciuba.pl</title>
            <meta name="description" content={category.description} />
            <meta property="og:title" content={category.name} />
          </MetaTags>
    <Header mainMenu={menu}/>
    <h1 className="text-center m-5 text-4xl leading-snug font-serif ">{category.name}</h1>
       {category.text && <ReactMarkdown className="m-4">
        {category.text}
      </ReactMarkdown>}
    <ImageList categorySlug={categorySlug}/>
    <Footer></Footer>
    </>
  )
}


import { Footer } from '../components/Footer';
import React from 'react';
import  Header from '../Header';
import { generatePath, Navigate, useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';
import { useQuery, gql, ApolloError } from '@apollo/client';
import { Query } from '@mkaciuba/api';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage, LoadingMore, Markdown, useSSRSafeQuery } from '@mkaciuba/ui-kit'
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';

export const GET_PHOTOS = gql`
  query ($categorySlug: String!, $gallerySlug: String!) {
  categoryBySlug (
    slug: $categorySlug
  ) {
    id
    name
    description
    public
    keywords
    text
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
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  let authRequired = false;
  if (error && error.graphQLErrors.some(g => g.extensions?.code === 'UNAUTHENTICATED')) {
    authRequired = true;
  } else if (error && error.graphQLErrors.some(g => g.extensions?.code === 'FORBIDDEN')) {
    authRequired = true;
  } else if (error) {
    console.error('Photos', error)
    return (<ErrorPage code={500} message={error.message} />)
  }

  if (authRequired) {
    return  (
      <Navigate to={`${generatePath(AppRoutes.login.path)}?gallery=${gallerySlug}&category=${categorySlug}`} replace />
    )
  }

  if (shouldShowLoading || !data?.galleryMenu || !data?.categoryBySlug) return <LoadingMore/>;

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
          <Helmet>
            <title>{category.name} | mkaciuba.pl</title>
            <meta name="description" content={category.description} />
            <meta property="og:title" content={category.name} />
          </Helmet>
    <Header mainMenu={menu}/>
    <h1 className="text-center m-5 text-4xl leading-snug font-serif ">{category.name}</h1>
       {category.text && <Markdown className="m-4 text-center font-serif post-text" text={category.text}/>}
    <ImageList categorySlug={categorySlug}/>
    <Footer></Footer>
    </>
  )
}

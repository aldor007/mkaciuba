import React from "react";
import { AppRoutes } from '../routes';
import gql from  'graphql-tag';
import { Query } from '@mkaciuba/api';
import { useQuery } from '@apollo/client/react';
import { generatePath } from "react-router";
import { Navbar } from "./Navbar";
import { ErrorPage, Loading, useSSRSafeQuery } from "@mkaciuba/ui-kit";

const GET_POST_CAT = gql`
query {
    postCategories {
      name
      slug
    }
  }
`

export const PostNavbar = () => {
  const { loading, error, data } = useQuery<Query>(GET_POST_CAT);
  const { shouldShowLoading } = useSSRSafeQuery(loading, data);

  if (error) {
    console.error('Post', error)
    return <ErrorPage code={500} message={error.message} />
   };

  if (shouldShowLoading) {
    return <Loading/>;
  }

  const children  = data!.postCategories.map((item) => {
      return {
        url: generatePath(AppRoutes.postcategory.path, {
            slug: item.slug
        }),
        name: item.name,
      }
  })

  let menu = [{
    name: 'Kategorie',
    url: '#',
    children,
  }]

  if (children.length  < 2) {
    menu = null;
  }

  return (
      <Navbar additionalMainMenu={menu} />
  )
}

import React, { useEffect, useState } from 'react';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag'
import { Query, Post as PostType, Enum_Post_Content_Position  } from '@mkaciuba/api';
import { generatePath, Redirect } from "react-router";
import { AppRoutes } from "../routes";


const GET_POST = gql`
  query ($permalink: String!) {
    postByPermalink(permalink: $permalink) {
     slug
  }
}
`;


export const OldPost = () => {
  const { year, month, slug } = useParams<{slug: string, year: string, month: string}>();
  const permalink = `/blog/${year}/${month}/${slug}`
  const { loading, error, data } = useQuery<Query>(GET_POST, {
    variables: { permalink},
  });

  if (loading) return <Loading/>;
  if (error) {
    console.error('Post', error)
    return <ErrorPage code={500} message={error.message} />
   };
  return  (
      <Redirect to={`${generatePath(AppRoutes.post.path, { slug: data.postByPermalink.slug })}`} />
    )
}
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


export const GalleryBlog = () => {
  const {slug } = useParams<{slug: string}>();
  return  (
      <Redirect to={`${generatePath(AppRoutes.photos.path, { categorySlug: slug, gallerySlug: 'portfolio' })}`} />
    )
}

export const GalleryBlogCategory = () => {
  const {slug } = useParams<{slug: string}>();
  return  (
      <Redirect to={`${generatePath(AppRoutes.categoryList.path, { gallerySlug: 'portfolio' })}`} />
    )
}
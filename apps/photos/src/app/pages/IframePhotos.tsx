
import React from 'react';
import { useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';

export const IframePhotos = () => {
  const { categorySlug } = useParams<{categorySlug: string}>();
  return  (
    <ImageList categorySlug={categorySlug}/>
  )
}

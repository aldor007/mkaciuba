
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ImageList } from '@mkaciuba/image';

export const IframePhotos = () => {
  const { categorySlug } = useParams();
  return  (
    <ImageList categorySlug={categorySlug}/>
  )
}

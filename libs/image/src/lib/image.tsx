
import { UploadFile } from '@mkaciuba/api';
import React, { RefObject, useState} from 'react';
import { findImageForWidth } from '..';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowWidth
} from '@react-hook/window-size';

export interface Image {
  url: string
  mediaQuery?: string
  webp: boolean
  type?: string
  width?: number
  height?: number
  alt?: string
}


export const toImage = (upload: UploadFile) =>  {
  const image: Image = {
    url: upload.url,
    webp: false,
    type: upload.mime,
    alt: upload.caption,
  }
  if (upload.thumbnail) {
    image.webp = upload.thumbnail.webp;
    image.width = upload.thumbnail.width;
    image.height = upload.thumbnail.height;
    image.url = upload.thumbnail.url;
  }

  if (upload.thumbnails) {
    console.warn('Multi images!')
  }

  return image;
}
export interface ImageComponentProps {
  thumbnails: Image[]
  defaultImage?: Image,
  ref?: RefObject<HTMLImageElement>
  onClick?: any
  alt?: string
  className?: string
}

export const ImageComponent = React.forwardRef(({thumbnails, defaultImage, onClick, alt, className} :ImageComponentProps, ref: RefObject<HTMLImageElement>) => {
  const [loading, setLoading] = useState(true)
  const webp = useWebPSupportCheck();
  const width = useWindowWidth();
  if (!defaultImage) {
    defaultImage = findImageForWidth(thumbnails, width, webp )
  }
  let classes = 'bg-gray-300 ' + className;
  if (loading) {
    classes += ' animate-pulse bg-opacity-15	'
  }

  const imageOnError = (img) => {
    setTimeout(() => {
      let prefix = '?';
      if (img.src.indexOf('?') !== -1) {
        prefix = '&';
      }
      img.src += prefix + +new Date
    }, 250)
  }
  return (
    <picture  ref={ref}>
      {thumbnails.map(thumbnail => (
          <source srcSet={thumbnail.url} key={thumbnail.url}  media={thumbnail.mediaQuery} type={thumbnail.type}/>
        ))}
      <img  onLoad={() => setLoading(false)} onError={imageOnError} onClick={onClick} width={defaultImage.width} height={defaultImage.height}  src={defaultImage.url} className={classes} alt={alt}/>
     </picture>
  )
})

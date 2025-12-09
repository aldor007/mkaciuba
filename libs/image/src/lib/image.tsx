
import { UploadFile } from '@mkaciuba/api';
import React, { RefObject, useState, useEffect, useCallback, useRef} from 'react';
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



export const findImageForWidthBigger = (images: Image[], width: number, webp: boolean) => {
  const filterPresets = images.filter(p => {
    if (p.webp == webp) {
      return p;
    }
  });
  let minIndex = 0;
  let minValue = Math.abs(width - filterPresets[0].width);
  const lowerZero = [];
  filterPresets.forEach((p, index) => {
    const tmpValue = width - p.width;
    if (tmpValue < 0) {
      lowerZero.push({
        value: tmpValue,
        index,
      });
    }
    if (tmpValue < minValue) {
      minIndex = index;
      minValue = tmpValue;
    }
  });
  minValue = -1000000;
  lowerZero.forEach(element => {
    if (element.value > minValue) {
      minValue = element.value;
      minIndex = element.index;
    }
  });

  return filterPresets[minIndex];
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

export enum DefaultImgSizing {
  DEFAULT = 2,
  BIGGER
}

export interface ImageComponentProps {
  thumbnails: Image[]
  defaultImage?: Image,
  ref?: RefObject<HTMLImageElement>
  onClick?: any
  alt?: string
  className?: string
  defaultImgSizing?: DefaultImgSizing
  initialWidth?: number
}

export const findImageForType = (images: Image[], webp: boolean) => {
  const filterPresets = images.filter(p => {
    if (p.webp == webp) {
      return p;
    }
  });

  return filterPresets[filterPresets.length - 1];
}

const addDatePrefix = (url) => {
    let prefix = '?';
    if (url.indexOf('?') !== -1) {
      prefix = '&';
    }
    return url + prefix + 'cache=' + Date.now()
}

export const ImageComponent = React.forwardRef(({thumbnails, defaultImage, onClick, alt, className, defaultImgSizing, initialWidth=1900}:ImageComponentProps, ref: RefObject<HTMLImageElement>) => {
  const [loading, setLoading] = useState(true)
  const errorCounterRef = useRef(0);
  const webp = useWebPSupportCheck();
  const width = useWindowWidth({ initialWidth})

  if (!defaultImage) {
    if (!defaultImgSizing || defaultImgSizing == DefaultImgSizing.DEFAULT) {
      defaultImage = findImageForWidth(thumbnails, width, webp)
    } else {
      defaultImage = findImageForWidthBigger(thumbnails, width, webp)
    }
  }

  // Fix memory leak: Use useEffect with cleanup for loading timeout
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Fix memory leak: Use useCallback for imageOnError to prevent recreating on every render
  const imageOnError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const timeoutId = setTimeout(() => {
      if (errorCounterRef.current > 4) {
        return;
      }
      const target = e.target as HTMLImageElement;
      target.src = addDatePrefix(target.src);
      errorCounterRef.current += 1;
    }, 250);

    // Note: Individual error timeouts are intentionally not cleaned up
    // as they represent retry attempts
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const classes = `bg-gray-300 ${className || ''} ${loading ? 'animate-pulse bg-opacity-15' : ''}`;

  return (
    <picture ref={ref}>
      {thumbnails && thumbnails.map(thumbnail => (
          <source srcSet={thumbnail.url} key={thumbnail.url} media={thumbnail.mediaQuery} type={thumbnail.type}/>
        ))}
      {defaultImage && <img
        onLoad={handleLoad}
        onError={imageOnError}
        onClick={onClick}
        width={defaultImage.width}
        height={defaultImage.height}
        src={defaultImage.url}
        className={classes}
        alt={alt}
        loading="lazy"
      />}
     </picture>
  )
})

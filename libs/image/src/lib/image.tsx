
import React, { useState} from 'react';

export interface Image {
  url: string
  mediaQuery: string
  webp: boolean
  type: string
  width: number
  height: number
}
export interface ImageComponentProps {
  thumbnails: Image[]
  defaultImage: Image
}

export const ImageComponent = ({thumbnails, defaultImage} :ImageComponentProps) => {
  const [loading, setLoading] = useState(false)
  let classes = '';
  if (loading) {
    classes = 'animate-pulse'
  }
  return (
    <picture onLoadStart={() => setLoading(true)} onLoad={() => setLoading(false)} className={classes}>
      {thumbnails.map(thumbnail => (
          <source srcSet={thumbnail.url} key={thumbnail.url}  media={thumbnail.mediaQuery} type={thumbnail.type}/>
        ))}
      {<img  width={defaultImage.width} height={defaultImage.height}  src={defaultImage.url} className="bg-gray-300"/>}
     </picture>
  )
}

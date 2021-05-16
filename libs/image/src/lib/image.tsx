
import React, { RefObject, useState} from 'react';

export interface Image {
  url: string
  mediaQuery?: string
  webp: boolean
  type?: string
  width?: number
  height?: number
  alt?: string
}
export interface ImageComponentProps {
  thumbnails: Image[]
  defaultImage: Image,
  ref?: RefObject<HTMLImageElement>
  onClick?: any
}

export const ImageComponent = React.forwardRef(({thumbnails, defaultImage, onClick} :ImageComponentProps, ref: RefObject<HTMLImageElement>) => {
  const [loading, setLoading] = useState(true)
  let classes = 'bg-gray-300';
  if (loading) {
    classes += ' animate-pulse animate-spin bg-opacity-15	'
  }
  return (
    <picture  ref={ref}>
      {thumbnails.map(thumbnail => (
          <source srcSet={thumbnail.url} key={thumbnail.url}  media={thumbnail.mediaQuery} type={thumbnail.type}/>
        ))}
      <img  onLoad={() => setLoading(false)}  onClick={onClick} width={defaultImage.width} height={defaultImage.height}  src={defaultImage.url} className={classes}/>
     </picture>
  )
})

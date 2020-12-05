import React from "react";
import { SimpleImg } from 'react-simple-img';

type Image = {
  url: string;
  mediaQuery: string;
  webp: boolean;
  type: string;
}

type Props = {
  images: [Image];
  title: string;
  defaultImage: string
};
export default ({ images, title, defaultImage }: Props) => {
    const sources = images.map(image => (
      <source srcSet={image.url} media={image.mediaQuery} type={image.type}/>
    ));
    return (
  <div className="relative cursor-pointer">
    <picture>
      {sources}
      <img src={defaultImage}/>
    </picture>
    <style jsx>{`
      .overlay {
        background: linear-gradient(0deg, black, transparent);
      }
    `}</style>
    <div className="overlay absolute bottom-0 w-full h-24 px-4 pt-6">
      <div className="text-white text-lg">{title}</div>
      <div className="text-gray-400 text-sm">Photographer</div>
    </div>
  </div>
  );
}

import React from "react";
import Masonry from "./components/Masonry";
import Card from "./components/Card";
import { gql, useQuery } from '@apollo/client';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import {
  useWindowWidth
} from '@react-hook/window-size';

const GET_CATEGORIES = gql`
  query categories($galleryId: Int!) {
  categories (where: {
    gallery: $galleryId
  }) {
    id
    image {
      url
     thumbnails {
        url
        mediaQuery
        webp
        type
      }
      defaultImage
    }
     name


  }
}
`;

export const ImageList = () => {
  const supportsWebP = useWebPSupportCheck();
  const viewportWidth = useWindowWidth({wait:500})

  const { loading, error, data } = useQuery(GET_CATEGORIES, {
    variables: { galleryId: 1 },
  });
  console.info(loading, error, data)
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };
    return (
  <Masonry>
    <style jsx>{`
      @screen md {
        .masonry {
          column-count: 2;
        }
      }
      .masonry {
        column-count: 3;
        column-gap: 2rem;
      }
      @screen lg {
        .masonry {
          column-count: 4;
        }
      }
    `}</style>
    <div className="masonry px-16 py-8">

      {!loading && data.categories.map(item => (
        <div className="rounded-lg overflow-hidden mb-8" key={item.image.defaultImage}>
          <Card images={item.image.thumbnails} defaultImage={item.image.defaultImage} title={item.image.title} />
        </div>
      ))}
    </div>
  </Masonry>)
};

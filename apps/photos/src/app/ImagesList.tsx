import React from "react";
import Masonry from "./components/Masonry";
import Card from "./components/Card";
import { gql, useQuery } from '@apollo/client';

const images = [
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1543297031-d102cd432d54?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/reserve/HgZuGu3gSD6db21T3lxm_San%20Zenone.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  },
  {
    title: "Photo title",
    img:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
  }
];

const GET_CATEGORIES = gql`
  query categories($galleryId: Int!) {
  categories (where: {
    gallery: $galleryId
  }) {
    id
    image {
      url
    }
     name


  }
}
`;

export const ImageList = () => {
  const { loading, error, data } = useQuery(GET_CATEGORIES, {
    variables: { galleryId: 1 },
  });
  console.info(loading, error, data)
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
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
        <div className="rounded-lg overflow-hidden mb-8" key={item.img}>
          <Card src={item.image.url} title={item.image.title} />
        </div>
      ))}
    </div>
  </Masonry>)
};

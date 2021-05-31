import React from "react";
import { FacebookProvider, Page } from 'react-facebook';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import { Query } from '@mkaciuba/api';
import { toImage } from "@mkaciuba/image";
import { generatePath, Link} from 'react-router-dom';
import { AppRoutes } from '../routes';

const GET_FOOTER = gql`
  query($webp: Boolean!) {
    categories(limit: 9, sort: "id:desc") {
      slug
      gallery {
        slug
       }
      randomImage {
        id
        caption
        thumbnail(width: 200, webp: $webp) {
          url
          width
          height
        }
      }
    }
    footer {
      FeaturedCategories {
          name
          url
        }
      }
  }
`;


export const Footer = () => {
  const webp = useWebPSupportCheck();
  const {loading, error, data} = useQuery<Query>(GET_FOOTER, {
    variables: { webp }
  });
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.info(error)
     return <p>Error :(</p>
   };

  const recentPhotos = data.categories.map(c => {
      let imagePath = generatePath(AppRoutes.photos.path, {
            gallerySlug: c.gallery.slug,
            categorySlug: c.slug,
      });

      // FIXME: not working
      // imagePath += `#&gid=${c.slug}&pid=${c.randomImage.id}`;
      const image = toImage(c.randomImage);
    return  (
      <div key={c.slug}>
      <Link to={imagePath}>
      <img  src={image.url} height={image.height}  width={image.width} alt={image.alt} />
      </Link>
      </div>
   )
  })
  const featuredCategories = data.footer.FeaturedCategories.filter(f => f.url).map( f => (
    <li className="leading-7 text-sm" key={f.name}>
      <Link to={f.url}>
        <p>{f.name}</p>
      </Link>
    </li>
  ))

return (

<div className="bg-gray-100 text-black	">
    <div className="flex flex-wrap container mx-auto pt-8 pb-4 ">

                   <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/2 xl:my-2 xl:px-2 xl:w-1/2 pb-6">
                <h4 className="uppercase px-1 my-1">Facebook</h4>
                <FacebookProvider appId="1724717534454966">
                  <Page href="https://www.facebook.com/mkaciubapl" tabs="timeline" />
                </FacebookProvider>

            </div>

            <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/4 xl:my-2 xl:px-2 xl:w-1/4 pb-6">
                <h4 className="uppercase px-1 my-1">Wyróżnione kategorie</h4>
                <ul className="">
                  {featuredCategories}
                </ul>
            </div>

            <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/4 xl:my-2 xl:px-2 xl:w-1/4 pb-6">
                <h4 className="uppercase px-1 my-1">Ostatnie zdjęcia</h4>
                <div className="grid grid-cols-3 gap-4">
                  {recentPhotos}
                </div>
            </div>


        </div>

  <hr/>

        <div className="pt-4 md:flex md:items-center md:justify-center ">
            </div>
        </div>
);
}

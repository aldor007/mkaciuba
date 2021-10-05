import React from "react";
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag';
import { useWebPSupportCheck } from "react-use-webp-support-check";
import { Query } from '@mkaciuba/api';
import { toImage, ImageComponent } from "@mkaciuba/image";
import { generatePath, Link} from 'react-router-dom';
import { AppRoutes } from '../routes';
import { Loading, ErrorPage} from "@mkaciuba/ui-kit";
import { FacebookProvider, Page } from 'react-facebook';

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
    tags {
      name
      slug
    }

  }
`;


export const Footer = () => {
  const webp = useWebPSupportCheck();
  const {loading, error, data} = useQuery<Query>(GET_FOOTER, {
    variables: { webp }
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Footer', error)
    return <ErrorPage code={500} message={error.message} />
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
  // const featuredCategories = data.footer.FeaturedCategories.filter(f => f.url).map( f => (
  //   <li className="leading-7 hover:underline text-lg 	leading-snug font-serif  text-xl " key={f.name}>
  //     <Link to={f.url}>
  //       {!f.image && <p>{f.name}</p>}
  //       {f.image && <div> <ImageComponent thumbnails={f.image.matchingThumbnails}  /> <p>{f.name}</p></div> }

  //     </Link>
  //   </li>
  // ))

  const tags = data.tags.map( t => (
    <li className="leading-7 hover:underline text-lg p-2	m-1 leading-snug font-serif border-gray-300	bg-gray-300 text-xl float-right" key={t.name}>
      <Link to={generatePath(AppRoutes.tag.path, {
        slug: t.slug
      })}>
        <p>{t.name}</p>
      </Link>
    </li>
  ))

return (

  <div className="w-full sm:mx-auto  text-gray-700 bg-gray-100 mt-8 pt-8">
    <div className="flex flex-col max-w-screen-xl  mx-auto  md:flex-row">
    <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/3 xl:my-2 xl:px-2 xl:w-1/3 pb-6">
      <h1 className="uppercase px-1 my-1  text-lg  font-semibold leading-snug font-serif  text-xl text-center">Tagi</h1>
      <ul className="text-lg 	leading-snug font-serif  text-xl ">
      {tags}
      </ul>
     </div>

    <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/3 xl:my-2 xl:px-2 xl:w-1/3 pb-6">
    <h1 className="uppercase px-1 my-1  text-lg  font-semibold leading-snug font-serif  text-xl text-center">Facebook</h1>
      <FacebookProvider appId="1724717534454966">
        <Page href="https://www.facebook.com/mkaciubapl" tabs="timeline" />
      </FacebookProvider>
    </div>

    <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/3 xl:my-2 xl:px-2 xl:w-1/3 pb-6">
      <h4 className="uppercase px-1 my-1 text-lg  font-semibold	leading-snug font-serif  text-xl text-center">Ostatnie zdjęcia</h4>
      <div className="grid grid-cols-3 gap-4">
        {recentPhotos}
      </div>
    </div>
  </div>
  </div>
);
}

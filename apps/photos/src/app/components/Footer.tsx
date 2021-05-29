import React from "react";
import { FacebookProvider, Page } from 'react-facebook';
import { gql, useQuery } from '@apollo/client';

const GET_IMAGES = gql`
  query categories {
    categories(limit: 9, sort: "id:desc") {
          slug
          gallery {
            slug
          }
          randomImage {
            id
            thumbnail(width: 200, webp: false) {
              url
            }
          }
        }
      }
}
`;

export const Footer = () => {

return (

<div className="bg-gray-400 text-black	">
    <div className="flex container mx-auto pt-8 pb-4 ">

                   <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/2 xl:my-2 xl:px-2 xl:w-1/2 pb-6">
                <h4 className="uppercase px-1 my-1">Facebook</h4>
                <FacebookProvider appId="1724717534454966">
                  <Page href="https://www.facebook.com/mkaciubapl" tabs="timeline" />
                </FacebookProvider>

            </div>

            <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/4 xl:my-2 xl:px-2 xl:w-1/4 pb-6">
                <h4 className="uppercase px-1 my-1">Fotografie</h4>
                <ul className="">
                <li className="leading-7 text-sm">
                    <a className="text-white underline text-small" href="/page-1">
                        Page 1 </a>
                </li>
                <li id="navi-1" className="leading-7 text-sm"><a className="text-white underline text-small" href="/page-2">Page 2</a></li>
                </ul>
            </div>

            <div className="flex-coll overflow-hidden sm:my-1 sm:px-1 sm:w-1/2 md:my-px md:px-px md:w-1/2 lg:my-2 lg:px-2 lg:w-1/4 xl:my-2 xl:px-2 xl:w-1/4 pb-6">
                <h4 className="uppercase px-1 my-1">Ostatnie zdjęcia</h4>
                <ul className="">
                <li className="leading-7 text-sm">
                    <a className="text-white underline text-small" href="/page-1">
                        Page 1 </a>
                </li>
                <li id="navi-1" className="leading-7 text-sm"><a className="text-white underline text-small" href="/page-2">Page 2</a></li>
                </ul>
            </div>


        </div>

  <hr/>

        <div className="pt-4 md:flex md:items-center md:justify-center ">
            </div>
        </div>
);
}

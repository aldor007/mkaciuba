
import React from "react";

import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { findImageForWidth, ImageComponent } from "@mkaciuba/image";
import { useWebPSupportCheck } from "react-use-webp-support-check";
import { Post } from '@mkaciuba/api';
import {
  useWindowWidth
} from '@react-hook/window-size';
import { AppRoutes } from "../routes";
import { format } from "date-fns";

export interface PostCardProps {
  post: Post
  inColumn?: boolean
}

export const PostCard = ({ post, inColumn }: PostCardProps) => {
    const webp = useWebPSupportCheck();
    const width = useWindowWidth();
    let headerClass ="relative  mx-auto max-w-screen-xl "
    let imageClass ="absolute text-lg bg-gray	leading-snug font-serif  top-1/3 sm:top-1/4 lg:top-1/2 z-10 h-16 min-w-full	 justify-center items-center  text-white"
    if (inColumn) {
      headerClass = "relative  mx-auto max-w-screen-xl lg:col-span-2 "
      imageClass ="absolute text-lg bg-gray	leading-snug font-serif  top-1/3 sm:top-1/4 lg:top-1/2 z-10 h-16 min-w-full	 justify-center items-center  text-white"
    }
    let titleFont = 'lg:text-6xl text-2xl'
    if (post.title.length > 22) {
      titleFont = 'lg:text-3xl text-4xl'
    }

    return (
      <div className={headerClass} key={`${post.title}-${post.id}`}>
        <div className="bg-cover bg-center z-0">
        {post.mainImage && <ImageComponent thumbnails={post.mainImage} /> }
        </div>
        <div className={imageClass}>
          <div className="container text-center overflow-hidden	 bg-gray-300 bg-opacity-40	 items-center mx-auto p-8">
            <div className="row">
              <Link to={generatePath(AppRoutes.post.path, {
                slug: post.slug,
              })}>
                <h1 className={`font-black md:text-2xl sm:text-2xl ${titleFont} hover:underline`} >{post.title}</h1>
               </Link>
            </div>
            <div className="row mt-3 ">
              <span className="meta-date">
                {format(new Date(post.publicationDate), 'dd/MM/yyyy')}
                </span>
              <span className="mx-3">•</span>
              <span className="underline hover:text-green">
                <Link to={generatePath(AppRoutes.postcategory.path, {
                  slug: post.category.slug,
                })}>
                  {post.category.name}
                  </Link>
                  </span>
            </div>
				  </div>
				</div>
        </div>
    )
}
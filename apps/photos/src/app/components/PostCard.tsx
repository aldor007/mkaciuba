
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

export interface PostCardProps {
  post: Post
}

export const PostCard = ({ post }: PostCardProps) => {
    const webp = useWebPSupportCheck();
    const width = useWindowWidth();
    let defaultImage = null;
    if (post.image) {
      defaultImage = findImageForWidth(post.image.matchingThumbnails, width, webp)
    }
    let titleFont = 'lg:text-5xl text-2xl'
    if (post.title.length > 14) {
      titleFont = 'lg:text-3xl text-4xl'
    }
    let headerClass = "relative  mx-auto max-w-screen-xl ";
    return (
      <div className={headerClass} key={`${post.title}-${post.id}`}>
        <div className="bg-cover bg-center z-0">
         { defaultImage && <ImageComponent thumbnails={post.image.matchingThumbnails} defaultImage={defaultImage} /> }
</div>
        <div className="absolute text-lg 	leading-snug font-serif inset-x-1/4 top-1/3 sm:top-1/4 lg:top-1/2 z-10 h-16  justify-center items-center  text-white">
          <div className="container text-center  items-center mx-auto p-3">
            <div className="row">
              <Link to={generatePath(AppRoutes.post.path, {
                slug: post.slug,
              })}>
                <h1 className={`font-black md:text-2xl sm:text-2xl ${titleFont} hover:underline`}>{post.title}</h1>
               </Link>
            </div>
            <div className="row mt-3 	inset-x-1/4 top-1/3 sm:top-1/4 lg:top-1/2 ">
              <span className="meta-date">
                {new Date(post.publicationDate).toLocaleDateString()}
                </span>
              <span className="mx-3">•</span>
              <span className="underline hover:text-green ">
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
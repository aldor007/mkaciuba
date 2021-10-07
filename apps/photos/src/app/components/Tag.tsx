
import { Query, Tag as TagApi } from "@mkaciuba/api";
import React from "react";
import { AppRoutes } from '../routes';
import { generatePath, Link} from 'react-router-dom';

export interface TagProps {
    tag: TagApi
    className?: string
}

export const Tag = ({tag}: TagProps) => {
    return (<div className="leading-7 hover:underline text-lg p-2	m-1 leading-snug font-serif border-gray-300	bg-gray-300 text-xl float-right" key={tag.name}>
      <Link to={generatePath(AppRoutes.tag.path, {
        slug: tag.slug
      })}>
        <p>{tag.name}</p>
      </Link>
    </div>)
}

import { Footer } from '../components/Footer';
import { Posts } from '../components/Posts';
import React, { useEffect, useState } from 'react';
import  Header from '../Header';
import { Loading, ErrorPage } from "@mkaciuba/ui-kit";
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import gql from  'graphql-tag'
import { Query, Post as PostType, Enum_Post_Content_Position  } from '@mkaciuba/api';
import { ImageComponent, ImageList } from '@mkaciuba/image';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom'
import { generatePath } from "react-router";
import { AppRoutes } from "../routes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { PostCard } from '../components/PostCard';



const GET_POST = gql`
  query ($postSlug: String!) {
    postBySlug(slug: $postSlug) {
      id
      title
      publicationDate

      gallery {
        slug
      }
      category {
        name
        slug
      }
      description
      text
      content_position
  }
  prevNextPost(slug: $postSlug) {
      id
      title
      slug
      image {
        id
        matchingThumbnails(preset: "small") {
            url
            mediaQuery
            webp
            type
            width
            height
          }
      }
     category {
        name
        slug
      }
  }

  relatedPosts(slug: $postSlug) {
    id
    title
    slug
    publicationDate
    image {
      id
      matchingThumbnails(preset: "postlist") {
          url
          mediaQuery
          webp
          type
          width
          height
      }
    }
    category {
      name
      slug
    }
 }
}
`;


export const Post = () => {
  const { slug } = useParams<{slug: string}>();
  const [showNext, setShowNext] = React.useState(false);
  const [showPrev, setShowPrev] = React.useState(false);
  const { loading, error, data } = useQuery<Query>(GET_POST, {
    variables: { postSlug: slug},
  });
  if (loading) return <Loading/>;
  if (error) {
    console.error('Post', error)
    return <ErrorPage code={500} message={error.message} />
   };

  const post = data.postBySlug;
  const [prevPost, nextPost] = data.prevNextPost;

  const returnArrow = (post: PostType, shouldShow: boolean, onHover, headingText, icon, direction: string) => {
    const inner = direction.includes('right') ? (<><div className="flex-cols m-2 font-bold	text-xl	">
      <h1 className="text-lg	text-gray-400	">{headingText}</h1>
        <Link to={generatePath(AppRoutes.post.path, {
          slug: post.slug,
        })}>
        <h2 className="text-gray-600">{post.title}</h2>
          </Link>
    </div>
    <div className="flex-col">
        <Link to={generatePath(AppRoutes.post.path, {
          slug: post.slug,
        })}>
    { post.image && <ImageComponent thumbnails={post.image.matchingThumbnails} defaultImage={post.image.matchingThumbnails[0]}/> }
    </Link>
    </div></>)
    : (<>
      <div className="flex font-bold	text-xl	w-full">
        <div className="-ml-2 col">
          <Link to={generatePath(AppRoutes.post.path, {
            slug: post.slug,
          })}>
         { post.image && <ImageComponent thumbnails={post.image.matchingThumbnails} defaultImage={post.image.matchingThumbnails[0]}/> }
        </Link>
        </div>
        <div>
          <div className="m-4 p-3">
        <h1 className="text-lg text-gray-400 col 	">{headingText}</h1>
          <Link to={generatePath(AppRoutes.post.path, {
            slug: post.slug,
          })}>
          <h2 className="text-gray-600">{post.title}</h2>
            </Link>
          </div>
        </div>
    </div></>) ;

    return (
      <div className={direction + " hidden sm:block  cursor-pointer fixed top-1/2"}  onMouseEnter={onHover(true)} onMouseLeave={onHover(false)} >
      <FontAwesomeIcon className={ shouldShow? "hidden": "" + "m-4 hover:hidden"} icon={icon} size='1x'  onMouseEnter={onHover(true)} onMouseLeave={onHover(false)} />
       <div className={ shouldShow ? "" : "hidden" + " transition-all	 delay-150 duration-800 ease-in-out bg-gray-300"}>
        <div className="flex leading-snug font-serif bg-gray-100 rounded shadow-xl">
          {inner}
        </div>
      </div>
      </div>)
}

  return  (
    <>
          <MetaTags>
            <title>{post.title}</title>
            <meta name="description" content={post.description} />
            <meta name="keywords" content={post.keywords} />
            <meta property="og:title" content={post.title} />
          </MetaTags>
    <Header/>
     <div className="fixed">
        {prevPost && returnArrow(prevPost, showPrev, (value) => () => setShowPrev(value), 'Starsze', faArrowLeft, 'left-0 ') }
        {nextPost && returnArrow(nextPost, showNext, (value) => () => setShowNext(value), 'Nowsze', faArrowRight, 'right-0 -m-4') }
      </div>
        <div className="text-lg  	leading-snug font-serif  justify-center items-center  text-black">
          <div className="container text-center  items-center mx-auto p-3">
            <div className="row">
            <h1 className="font-black text-lg 	leading-snug font-serif  md:text-3xl sm:text-1xl text-4xl text-center">{post.title}</h1>
            </div>
            <div className="row m-3">
              <span className="meta-date">
                {new Date(post.publicationDate).toLocaleDateString()}
                </span>
              <span className="mx-3">•</span>
              <span className="underline">
                <Link to={generatePath(AppRoutes.postcategory.path, {
                  slug: post.category.slug,
                })}>
                  {post.category.name}
                  </Link>
                  </span>
            </div>
				  </div>
				</div>
    <div className="max-w-screen-xl mx-auto post-text">
            <p className="m-4" dangerouslySetInnerHTML={{
              __html: post.description
              }}/>
        {post.content_position === Enum_Post_Content_Position.Top  && <p  dangerouslySetInnerHTML={{
              __html: post.text
              }}/>}
      <ImageList categorySlug={post.gallery.slug} minSize={true} />
        {post.content_position === Enum_Post_Content_Position.Bottom && <p  dangerouslySetInnerHTML={{
              __html: post.text
              }}/>}
      <hr className="divide-y m-8 bg-gray-700" />
      </div>
      <>
      </>
    <h1 className="m-8 font-black text-lg 	leading-snug font-serif  md:text-3xl sm:text-1xl text-4xl text-center">Powiązane posty</h1>
    <div className="max-w-screen-xl mx-auto grid xl:grid-cols-2  gap-4">

        {data.relatedPosts && data.relatedPosts.map((post) => (
          <PostCard post={post} key={post.id} />
        ))}
      </div>
    <Footer></Footer>
    </>
  )
}

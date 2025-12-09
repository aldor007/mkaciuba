import { lazy } from 'react';
import { AppRoutes } from './app/routes';

// Lazy load route components for code splitting
const Home = lazy(() => import('./app/pages/Home').then(m => ({ default: m.Home })));
const Categories = lazy(() => import('./app/pages/Categories').then(m => ({ default: m.Categories })));
const Photos = lazy(() => import('./app/pages/Photos').then(m => ({ default: m.Photos })));
const Login = lazy(() => import('./app/pages/Login').then(m => ({ default: m.Login })));
const IframePhotos = lazy(() => import('./app/pages/IframePhotos').then(m => ({ default: m.IframePhotos })));
const Post = lazy(() => import('./app/pages/Post').then(m => ({ default: m.Post })));
const PostCategory = lazy(() => import('./app/pages/PostCategory').then(m => ({ default: m.PostCategory })));
const OldPost = lazy(() => import('./app/pages/OldPosts').then(m => ({ default: m.OldPost })));
const PostTag = lazy(() => import('./app/pages/PostTag').then(m => ({ default: m.PostTag })));
const Page = lazy(() => import('./app/pages/Page').then(m => ({ default: m.Page })));
const GalleryBlog = lazy(() => import('./app/pages/GalleryBlog').then(m => ({ default: m.GalleryBlog })));
const GalleryBlogCategory = lazy(() => import('./app/pages/GalleryBlog').then(m => ({ default: m.GalleryBlogCategory })));

export const Routes = [
    {
        component: Photos,
        path: AppRoutes.photos.path
    },
    {
        component: Categories,
        path: AppRoutes.categoryList.path
    },
    {
        component: IframePhotos,
        path: AppRoutes.iframePhotos.path
    },
    {
        component: Login,
        path: AppRoutes.login.path
    },
    {
        component: Post,
        path: AppRoutes.post.path
    },
    {
        component: PostCategory,
        path: AppRoutes.postcategory.path
    },
    {
        component: OldPost,
        path: AppRoutes.oldposts.path
    },
    {
        component: PostTag,
        path: AppRoutes.tag.path
    },
    {
        component: Page,
        path: AppRoutes.page.path,
        exact: true
    },
    {
        component: GalleryBlog,
        path: AppRoutes.oldphotos.path,
        exact: true
    },
    {
        component: GalleryBlogCategory,
        path: AppRoutes.oldgalleryblog.path,
        exact: true
    },
    {
        component: GalleryBlogCategory,
        path:'/galeria/fotografie',
        exact: true
    },
    {
        component: Home,
        path: '/',
        exact: true
    },
]


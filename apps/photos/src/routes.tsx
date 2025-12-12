import loadable from '@loadable/component';
import { Route, Routes } from 'react-router-dom';
import { AppRoutes } from './app/routes';

// Lazy load route components for code splitting
// On client: creates separate chunks that load on demand
// On server: bundled together (no chunks) due to webpack config
const Home = loadable(() => import('./app/pages/Home').then(m => ({ default: m.Home })));
const Categories = loadable(() => import('./app/pages/Categories').then(m => ({ default: m.Categories })));
const Photos = loadable(() => import('./app/pages/Photos').then(m => ({ default: m.Photos })));
const Login = loadable(() => import('./app/pages/Login').then(m => ({ default: m.Login })));
const IframePhotos = loadable(() => import('./app/pages/IframePhotos').then(m => ({ default: m.IframePhotos })));
const Post = loadable(() => import('./app/pages/Post').then(m => ({ default: m.Post })));
const PostCategory = loadable(() => import('./app/pages/PostCategory').then(m => ({ default: m.PostCategory })));
const OldPost = loadable(() => import('./app/pages/OldPosts').then(m => ({ default: m.OldPost })));
const PostTag = loadable(() => import('./app/pages/PostTag').then(m => ({ default: m.PostTag })));
const Page = loadable(() => import('./app/pages/Page').then(m => ({ default: m.Page })));
const GalleryBlog = loadable(() => import('./app/pages/GalleryBlog').then(m => ({ default: m.GalleryBlog })));
const GalleryBlogCategory = loadable(() => import('./app/pages/GalleryBlog').then(m => ({ default: m.GalleryBlogCategory })));

export const AppRoutesComponent = () => (
  <Routes>
    <Route path={AppRoutes.photos.path} element={<Photos />} />
    <Route path={AppRoutes.categoryList.path} element={<Categories />} />
    <Route path={AppRoutes.iframePhotos.path} element={<IframePhotos />} />
    <Route path={AppRoutes.login.path} element={<Login />} />
    <Route path={AppRoutes.post.path} element={<Post />} />
    <Route path={AppRoutes.postcategory.path} element={<PostCategory />} />
    <Route path={AppRoutes.oldposts.path} element={<OldPost />} />
    <Route path={AppRoutes.tag.path} element={<PostTag />} />
    <Route path={AppRoutes.page.path} element={<Page />} />
    <Route path={AppRoutes.oldphotos.path} element={<GalleryBlog />} />
    <Route path={AppRoutes.oldgalleryblog.path} element={<GalleryBlogCategory />} />
    <Route path="/galeria/fotografie" element={<GalleryBlogCategory />} />
    <Route path="/" element={<Home />} />
  </Routes>
);

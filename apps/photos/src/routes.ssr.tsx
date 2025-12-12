import { Route, Routes } from 'react-router-dom';
import { AppRoutes } from './app/routes';

// Direct imports for SSR - no code splitting on server
import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';
import { Login } from './app/pages/Login';
import { IframePhotos } from './app/pages/IframePhotos';
import { Post } from './app/pages/Post';
import { PostCategory } from './app/pages/PostCategory';
import { OldPost } from './app/pages/OldPosts';
import { PostTag } from './app/pages/PostTag';
import { Page } from './app/pages/Page';
import { GalleryBlog, GalleryBlogCategory } from './app/pages/GalleryBlog';

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

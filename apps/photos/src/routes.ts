import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';
import { Login } from './app/pages/Login';
import { IframePhotos } from './app/pages/IframePhotos';
import { AppRoutes } from './app/routes';
import { Post  } from './app/pages/Post';
import { PostCategory } from './app/pages/PostCategory';
import { OldPost } from './app/pages/OldPosts';
import { PostTag } from './app/pages/PostTag';
import { Page } from './app/pages/Page';

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
        component: Home,
        path: '/',
        exact: true
    },
]


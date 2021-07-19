import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';
import { Login } from './app/pages/Login';
import { IframePhotos } from './app/pages/IframePhotos';
import { AppRoutes } from './app/routes';
import { Post  } from './app/pages/Post';
import { PostCategory } from './app/pages/PostCategory';

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
        component: Home,
        path: '/',
        exact: true
    },
]


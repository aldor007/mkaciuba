import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';
import { IframePhotos } from './app/pages/IframePhotos';
import { AppRoutes } from './app/routes';

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
        component: Home,
        path: '/',
        exact: true
    },
]


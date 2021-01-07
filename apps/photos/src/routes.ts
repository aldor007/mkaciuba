import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';
import { IframePhotos } from './app/pages/IframePhotos';


export const Routes = [
    {
        component: Photos,
        path: '/gallery/:gallerySlug/:categorySlug',
       name: 'photos'
    },
    {
        component: Categories,
        path: '/gallery/:gallerySlug',
        name: 'categoryList'
    },
    {
        component: IframePhotos,
        path: '/iframe/:gallerySlug/:categorySlug',
       name: 'iframe-photos'
    },
    {
        component: Home,
        path: '/',
        exact: true
    },
]

export const RoutesMap = Routes.reduce((acc, cur) => ({ ...acc, [cur.name]: cur }))

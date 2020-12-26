import { Home } from './app/pages/Home';
import { Categories } from './app/pages/Categories';
import { Photos } from './app/pages/Photos';


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
        component: Home,
        path: '/',
        exact: true
    },
]

export const RoutesMap = Routes.reduce((acc, cur) => ({ ...acc, [cur.name]: cur }))

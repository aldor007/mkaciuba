export const AppRoutes = {
  'login': {
        path: '/gallery-login',
    },
    'photos' : {
        path: '/gallery/:gallerySlug/:categorySlug',
    },
  'categoryList': {
        path: '/gallery/:gallerySlug',
    },
   'iframePhotos': {
        path: '/iframe/:gallerySlug/:categorySlug',
    },
    root: {
        path: '/',
        exact: true
    },
  'post': {
        path: '/blog/:slug',
    },
  'postcategory': {
        path: '/blog/category/:slug',
    },
}
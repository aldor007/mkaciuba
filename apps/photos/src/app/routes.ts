export const AppRoutes = {
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
}
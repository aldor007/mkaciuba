import { Image } from '@mkaciuba/image';

export type ProductMaterial = 'oak' | 'ash' | 'walnut' | 'other';
export type ProductAvailability = 'in_stock' | 'made_to_order' | 'unavailable';

export interface ProductImage {
  __typename?: 'UploadFile';
  id: string;
  name?: string | null;
  alternativeText?: string | null;
  caption?: string | null;
  thumbnails: Image[];
}

/**
 * Local Product type for the /wood addon.
 * Mirrors the Strapi `Product` content type (blog/api/product) until
 * `blog/graphql.tsx` is regenerated with the backend running.
 */
export interface Product {
  __typename?: 'Product';
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  dimensions?: string | null;
  price?: number | null;
  material?: ProductMaterial | null;
  availability?: ProductAvailability | null;
  publicationDate: string;
  images: ProductImage[];
}

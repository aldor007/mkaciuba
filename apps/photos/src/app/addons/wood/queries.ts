import gql from 'graphql-tag';
import { Product } from './types';

const PRODUCT_IMAGE_FRAGMENT = gql`
  fragment ProductImageFields on UploadFile {
    id
    name
    alternativeText
    caption
    thumbnails {
      url
      mediaQuery
      webp
      type
      width
      height
    }
  }
`;

export const GET_WOOD_PRODUCTS = gql`
  ${PRODUCT_IMAGE_FRAGMENT}
  query woodProducts($start: Int, $limit: Int, $sort: String, $where: JSON) {
    products(start: $start, limit: $limit, sort: $sort, where: $where) {
      id
      name
      slug
      description
      dimensions
      price
      material
      availability
      publicationDate
      images {
        ...ProductImageFields
      }
    }
    productsCount(where: $where)
  }
`;

export interface WoodProductsData {
  products: Product[];
  productsCount: number;
}

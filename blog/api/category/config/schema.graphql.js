const { getStoragePath, base64Url } = require('../../../lib/index');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const { getImage, presetList, allPresets, getOriginalUrl } = require('../../../lib/image')

const getCacheKey = (prefix, options = {}, obj = {}) => {
  if (options.where) {
    prefix += JSON.stringify(options.where);
  }
  if (options.id_in) {
    prefix += JSON.stringify(options.id_in)
  }
  if (options.slug) {
    prefix += options.slug;
  }
  return `${prefix}:${options.limit}:${options.sort}:${obj.id}`;
}
module.exports = {
    definition: `
  type Image {
    url: String!
    mediaQuery: String
    width: Int!
    height: Int!
    type: String
    webp: Boolean!
  }
  type ValidationToken {
    valid: Boolean!
    token: String
  }
  extend type UploadFile {
    thumbnails: [Image]
    thumbnail(width: Int, webp: Boolean): Image
    matchingThumbnails(preset: String): [Image]
  }
  extend type Query {
    categoryBySlug(slug: String): Category
    recentImages(limit: Int): [UploadFile]
    categoriesCount(where: JSON): Int!
  }
  extend type Category {
    randomImage: UploadFile
    mediasCount: Int!
  }
  extend type Mutation {
    validateTokenForCategory(token: String, categorySlug: String): ValidationToken
  }
  `,
  resolver: {
    UploadFile: {
      thumbnail: {
        resolverOf: 'application::category.category.findOne', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, ctx) => {
          // return getImage(obj, presetList.filter(p => p.name == 'big1000')[0]);
          const filterPresets = presetList.filter(p => {
            if (p.webp == options.webp) {
              return p;
            }
          });
          const image = obj;
          let minIndex = 0;
          let minValue = Math.abs(options.width - filterPresets[0].width);
          filterPresets.forEach((p, index) => {
            const tmpValue = Math.abs(options.width - p.width);
            if (tmpValue < minValue) {
              minIndex = index;
              minValue = tmpValue;
            }
          });
          return getImage(image, filterPresets[minIndex]);
        },
      },
      thumbnails: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, ctx) => {

          const result = [];
          for (const p of presetList) {
            result.push(getImage(obj, p))
          }
          return result;
        },
      },
      matchingThumbnails: {
        resolverOf: 'application::category.category.find',
        resolver: async (obj, options, ctx) => {
          const result = [];
          for (const p of allPresets) {
            if(p.name.includes(options.preset)) {
              result.push(getImage(obj, p))
            }
          }
          return result;
        },
      },
    },
    Category: {
      mediasCount: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }) => {
          return obj.medias.length;
        }
      },
      randomImage: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          const images = obj.medias.filter(o => o.id)

          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          let image = images[Math.floor(Math.random() * (obj.medias.length - 1))];
          if (!image) {
            image = images[0];
          }
          return image;
        }
      },
      file: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          if (!obj.public) {
            const token = context.request.headers['x-gallery-token'];
            info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
            if (!token) {
              return new AuthenticationError('auth required for file')
            }

            try {
                jwt.verify(token, obj.token);
            } catch (e) {
              console.error('error ', e)
              return new ForbiddenError("invalid token parse");
            }
          } else {
            info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PUBLIC' });
          }
          obj.file.url = getOriginalUrl(obj.file);
          return obj.file;
        }
      },
      medias: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          const search = options.where || {};
          options.start = options.start || 0;
          search._limit =  options.limit;
          search._start = options.start;
          if (options._sort) {
            search._sort = options.sort;
          }
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          return obj.medias.sort((a, b) => a - b).slice(options.start, options.start + options.limit);
       }
     }
    },
    Query: {
      category: false,
      categoriesCount: {
        resolverOf: 'application::category.category.find',
        resolver: async (obj, options, { context }, info) => {
          const search = options.where || {};
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.gallery_null = false;
          search.publicationDate_lt = new Date();
          return await strapi.services.category.count(search || {});
        }
      },
      categories: {
        resolverOf: 'application::category.category.find',
        resolver: async (obj, options, { context }, info) => {
          const search = options.where || {};
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.publicationDate_lt = new Date();
          search.gallery_null = false;
          search.public = true;
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          let categories = await strapi.services.category.find(search);
          categories = categories.map(c => { c.file = null
            return c;
          })

          return categories;
        }
      },
      categoryBySlug: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          const key = getCacheKey('categoryv4', options)
          let category = await strapi.services.cache.get(key);
          if (!category) {
            category = await strapi.services.category.findOne({ slug: options.slug });
            if (category) {
              strapi.services.cache.set(key, category, 600);
            }
          }

          if (!category) {
            return new UserInputError('unable to find category ')
          }

          if (!category.public) {
            const token = context.request.headers['x-gallery-token'];
            info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PRIVATE' });
            if (!token) {
              return new AuthenticationError('auth required')
            }

            try {
                jwt.verify(token, category.token);
            } catch (e) {
              console.error('error ', e)
              return new ForbiddenError("invalid token parse");
            }
          } else {
            info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          }
          return category;
        }
      },
      recentImages: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          if (options.limit > 9) {
            return new UserInputError('Has to be less than 9')
          }
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          const key = getCacheKey('recentImages-v2', options);
          let images = await strapi.services.cache.get(key);
          if (images) {
            return images;
          }
          let category = await strapi.services.category.findOne({ name: 'Blog' });
          images = category.map((c) => {
            return c.medias[Math.floor(Math.random() * c.medias.length) - 1];
          });
          strapi.services.cache.set(key, images, 600)
          return images;
        }
      }
    },
    Mutation: {
      validateTokenForCategory: {
        resolverOf: 'application::category.category.findOne', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, { context }) => {
          const category = await strapi.services.category.findOne({ slug: options.categorySlug})
          if (!category) {
            return new UserInputError('unable to find gallery')
          }
          if (options.token === category.token) {
             const token = jwt.sign({
                categorySlug: options.categorySlug
              }, options.token,  { expiresIn: '4h' });
            context.cookies.set('category_token', token)
            return {
              valid: true,
              token
            }
          }

          return {
            valid: false
          };
        }
      }
    }
  }
};

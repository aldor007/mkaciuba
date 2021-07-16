const { getStoragePath, base64Url } = require('../../../lib/index');
const slugify = require('slugify');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');

class Preset {
  constructor(name, width, height, mediaQuery, type) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.mediaQuery = mediaQuery;
    this.type = type;
    this.webp = type.includes('webp')
  }

  calculateSize(imageWidth, imageHeight) {
    if (this.width && this.height) {
      return {
        width: this.width,
        height: this.height,
      }
    } else if (this.width) {
      const ratio = this.width / imageWidth;
      const height = Math.floor(imageHeight * ratio);
      return {
        width: this.width,
        height,
      }
    } else {
      const ratio = this.height / imageHeight;
      const width = Math.floor(imageWidth * ratio);
      return {
        width,
        height: this.height
      }
    }

  }
}

const presetList = [
  new Preset('icon', 35, null, '(max-width: 75px)', 'jpeg'),
  new Preset('bigwebp', 700, null, '(max-width: 1000px)', 'webp'),
  new Preset('big1000webp', 1000, null, '(max-width: 1300px)', 'webp'),
  new Preset('big1300webp', 1300, null, '(max-width: 1600px)', 'webp'),
  new Preset('big', 700, null, '(max-width: 1000px)', 'jpeg'),
  new Preset('small', 150, null, '(max-width: 400px)', 'jpeg'),
  new Preset('big1000', 1000, null, '(max-width: 1300px)', 'jpeg'),
  new Preset('big1300', 1300, null, '(max-width: 1600px)', 'jpeg'),

]

const allPresets = presetList.concat([

  new Preset('categorylist', 600, 450, '(max-width: 1000px)', 'jpeg'),
  new Preset('categorylistwebp', 600, 450, '(max-width: 1000px)', 'webp'),
  new Preset('categorylists', 300, 225, '(max-width: 600px)', 'jpeg'),
  new Preset('categorylistwebps', 300, 225, '(max-width: 600px)', 'webp'),
  new Preset('postlist', 1500, 1000, '(max-width: 1300px)', 'jpeg'),
  new Preset('postlistwebp', 1500, 1000, '(max-width: 1300px)', 'webp'),
  new Preset('postlists', 750, 750, '(max-width: 600px)', 'jpeg'),
  new Preset('postlistwebps', 750, 740, '(max-width: 600px)', 'webp'),
]);



class Image {
  constructor(url, mediaQuery, width, height, type) {
    this.url = url;
    this.mediaQuery = mediaQuery;
    this.width = width;
    this.height = height;
    this.type = type;
    this.webp = type.includes('webp')

  }
}

const getImage = (obj, preset) => {
  const imageDim = preset.calculateSize(obj.width, obj.height);

  return new Image(getImageUrl(obj, preset.name), preset.mediaQuery, imageDim.width, imageDim.height, preset.type);
}

const getImageUrl = (obj, preset) => {
  const parent = base64Url(obj.path);
  let caption = obj.caption || obj.alternativeText || obj.name;
  caption = caption.replace(/_/g, '-').replace(/\./g, '-').replace(/ /g, '-').replace(':', '').replace(')', '').replace('(', '')
  caption = slugify(caption);
  return `https://mort.mkaciuba.com/images/transform/${parent}/photo_${caption}_${preset}${obj.ext}`
}

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
            console.info('--->', p.name, options.preset)
            if(p.name.includes(options.preset)) {
          strapi.log.debug('--------jeest---->',options.preset)
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
          const key = getCacheKey('categories' + search.publicationDate_lt, options);
          let categories = await strapi.services.cache.get(key)
          if (categories) {
            return categories.length;
          }
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
          const key = getCacheKey('categories' + search.publicationDate_lt, options);
          let categories = await strapi.services.cache.get(key)
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          if (categories) {
            return categories;
          }
          categories = await strapi.services.category.find(search);
          strapi.services.cache.set(key, categories, 60*60);

          return categories;
        }
      },
      categoryBySlug: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }, info) => {
          const key = getCacheKey('categoryv2', options)
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
          const key = getCacheKey('recentImages-', options);
          let images = await strapi.services.cache.get(key);
          if (images) {
            return images;
          }
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

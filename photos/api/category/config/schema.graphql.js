const { getStoragePath, base64Url } = require('../../../lib/index');
const LRU = require("lru-cache");
const lruCache = new LRU({ max: 300, maxAge: 1000 * 60 * 5 });
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
  new Preset('bigwebp', 700, null, '(max-width: 1000px)', 'webp'),
  new Preset('big1000webp', 1000, null, '(max-width: 1300px)', 'webp'),
  new Preset('big1300webp', 1300, null, '(max-width: 1600px)', 'webp'),
  new Preset('big', 700, null, '(max-width: 1000px)', 'jpeg'),
  new Preset('big1000', 1000, null, '(max-width: 1300px)', 'jpeg'),
  new Preset('big1300', 1300, null, '(max-width: 1600px)', 'jpeg'),
]



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
  caption = caption.replace(/_/g, '-').replace(/\./g, '-').replace(/ /g, '-').replace(':', '').replace(')', '')
  caption = slugify(caption);
  return `https://mort.mkaciuba.com/images/transform/${parent}/photo_${caption}_${preset}${obj.ext}`
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
  }
  extend type Query {
    categoryBySlug(slug: String): Category
    recentImages(limit: Int): [UploadFile]
  }
  extend type Category {
    randomImage: UploadFile
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
          let minIndex = 0;
          let minValue = options.width - filterPresets[0].width;
          filterPresets.forEach((p, index) => {
            const tmpValue = options.width - p.width;
            if (tmpValue > 0 && tmpValue < minValue) {
              minIndex = index;
              minValue = tmpValue;
            }
          });
          return getImage(obj, filterPresets[minIndex]);
        },
      },
      thumbnails: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, ctx) => {

          let image = lruCache.get(obj.id)
          if (!image) {
            image = await strapi
            .query('File', 'upload')
            .model.query(qb => {
              qb.where('id', obj.id);
            })
            .fetch();
            lruCache.set(obj.id, image);
          }

          const result = [];
          for (const p of presetList) {
            result.push(getImage(image.attributes, p))
          }
          return result;
        },
      },
    },
    Category: {
      randomImage: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }) => {
          const images = obj.medias.filter(o => o.id)
          let image = images[Math.floor(Math.random() * (obj.medias.length - 1))];
          if (!image) {
            image = images[0];
          }
          return image;
        }
      },
      medias: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }) => {
          const search = options.where || {};
          search._limit =  options.limit;
          search._start = options.start || 1;
          if (options._sort) {
            search._sort = options.sort;
          }
          search.id_in= obj.medias.map(o => o.id).filter(o => o)
          const key = 'medias' + JSON.stringify(search);
          let images = lruCache.get(key);
          if (images) {
            // obj.medias = images;
            return images;
          }

          images = await strapi.plugins.upload.services.upload.fetchAll(search)
          // obj.medias = images;
          // lruCache.set(key, images);
          return images;

       }
     }
    },
    Query: {
      category: false,
      categories: {
        resolverOf: 'application::category.category.find',
        resolver: async (obj, options, { context }) => {
          const search = options.where || {};
          search._limit =  options.limit;
          search._start = options.start || 1;
          search._sort = options.sort || 'id:desc'
          search.public = true;
          search.gallery_null = false;
          const key = JSON.stringify(search);
          let categories = lruCache.get(key)
          if (categories) {
            return categories;
          }
          categories = await strapi.services.category.find(search);
          // lruCache.set(key, categories);

          return categories;
        }
      },
      categoryBySlug: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }) => {
          const category = await strapi.services.category.findOne({ slug: options.slug, _limit: options.limit});
          if (!category) {
            return new UserInputError('unable to find gallery')
          }

          if (!category.public) {
            const token = context.cookies.get('category_token')
            if (!token) {
              return new AuthenticationError('auth required')
            }

            try {
                jwt.verify(token, category.token);
            } catch (e) {
              return new ForbiddenError("invalid token");
            }
          }
          return category;
        }
      },
      recentImages: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, { context }) => {
          if (options.limit > 9) {
            return new UserInputError('Has to be less than 9')
          }
          const key = 'recentImages-' + options.limit + obj.slug;
          let images = lruCache.get(key);
          if (images) {
            return images;
          }
          images = category.map((c) => {
            return c.medias[Math.floor(Math.random() * c.medias.length) - 1];
          });
          lruCache.set(key, images )
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

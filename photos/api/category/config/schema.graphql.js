const { getStoragePath, base64Url } = require('../../../lib/index');
const LRU = require("lru-cache");
const lruCache = new LRU({ max: 30, maxAge: 1000 * 60 * 5 });
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
    Query: {
      category: false,
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
          category.medias = null;
          return category;
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

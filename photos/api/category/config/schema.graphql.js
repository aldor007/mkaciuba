const { getStoragePath, base64Url } = require('../../../lib/index');

const getImageUrl = (obj, preset) => {
  const parent = base64Url(getStoragePath(obj));
  let caption = obj.caption || obj.alternativeText || obj.name;
  caption = caption.replace(/_/, '-').replace('\.', '-')
  return `https://mort.mkaciuba.com/images/transform/${parent}/photo_${caption}_${preset}${obj.ext}`
}
module.exports = {
    definition: `
  type Image {
    url: String!
    mediaQuery: String
    type: String
    webp: Boolean!
  }
  extend type UploadFile {
    transform(preset: String!): String!
    transforms(presets: [String]!): [String!]
    thumbnails: [Image]
    defaultImage: String!
  }
  `,
  resolver: {
    UploadFile: {
      transform: {
        resolverOf: 'application::category.category.findOne', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, ctx) => {
          const preset = options.preset;
          return getImageUrl(obj, preset)
        },
      },
      transforms: {
        resolverOf: 'application::category.category.findOne', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, ctx) => {
          const presets = options.presets;
          const result = [];
          for (const preset of presets) {
            result.push(getImageUrl(obj, preset));
          }
          return result;
        },
      },
      defaultImage: {
        resolverOf: 'application::category.category.findOne', // Will apply the same policy on the custom resolver as the controller's action `findByCategories`.
        resolver: async (obj, options, ctx) => {
          return getImageUrl(obj, 'big');
        },
      },
      thumbnails: {
        resolverOf: 'application::category.category.findOne',
        resolver: async (obj, options, ctx) => {
          const presets = ['small', 'medium', 'big'];
          const mediaQuery = ['(max-width: 750px)', '(max-width: 1000px)'];
          const result = [];
          // XXX: order is important. webp has to be on top
          for (const i in presets) {
            result.push({
              url: getImageUrl(obj, presets[i]  + 'webp'),
              type: "image/webp",
              mediaQuery: mediaQuery[i],
              webp: true
            })
          }

          for (const i in presets) {
            result.push({
              url: getImageUrl(obj, presets[i]),
              mediaQuery: mediaQuery[i],
              webp: false
            })
          }
          return result;
        },
      },
    },
  }
};

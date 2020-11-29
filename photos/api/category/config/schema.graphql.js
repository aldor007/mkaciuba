const { getStoragePath, base64Url } = require('../../../lib/index');

const getImageUrl = (obj, preset) => {
  const parent = base64Url(getStoragePath(obj));
  let caption = obj.caption || obj.alternativeText || obj.name;
  caption = caption.replace(/_/, '-').replace('\.', '-')
  return `https://mort.mkaciuba.com/images/transform/${parent}/photo_${caption}_${preset}${obj.ext}`
}
module.exports = {
    definition: `
  extend type UploadFile {
    transform(preset: String!): String!
    transforms(presets: [String]!): [String!]
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
    },
  }
};

'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');
const strapiProviderUploadMort = require('../../../providers/strapi-provider-upload-mort');

module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      if (data.Name) {
        data.slug = `${slugify(data.name, {lower: true})}-${data.id}`;
      }
    },
    async beforeUpdate(params, data) {
      if (data.name) {
        data.slug = `${slugify(data.name, {lower: true})}-${params.id}`;
      }
    },
  },
};

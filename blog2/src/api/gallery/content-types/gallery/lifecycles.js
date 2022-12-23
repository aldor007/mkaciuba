'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');
module.exports = {
  /**
   * Triggered before user creation.
   */
    async beforeCreate(data) {
      if (data.name) {
        data.slug = `${slugify(data.name, {lower: true})}-${Math.random()}`;
      }
    },
    async beforeUpdate(params, data) {
      if (data.slugOverride) {
        data.slug = data.slugOverride
      }
    },
};
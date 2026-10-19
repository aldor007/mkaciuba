'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');
const { makeid } = require('../../../lib');

module.exports = {
  /**
   * Triggered before product creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      if (data.name) {
        data.slug = `${slugify(data.name, {lower: true})}-${makeid(4)}`;
      }
    },
  },
};

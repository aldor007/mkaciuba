'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const slugify = require('slugify');
const { makeid } = require('../../../../lib');
module.exports = {
    async beforeCreate(data) {
      if (data.title) {
        data.slug = `${slugify(data.title, {lower: true})}-${makeid(4)}`;
      }
    },
};

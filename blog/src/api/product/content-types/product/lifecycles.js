'use strict';

const slugify = require('slugify');
const { makeid } = require('../../../../../lib');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.name) {
      data.slug = `${slugify(data.name, { lower: true })}-${makeid(4)}`;
    }
  },
};

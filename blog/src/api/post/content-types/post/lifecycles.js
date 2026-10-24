'use strict';

const slugify = require('slugify');
const { makeid } = require('../../../../../lib');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.title) {
      data.slug = `${slugify(data.title, { lower: true })}-${makeid(4)}`;
    }
  },
};

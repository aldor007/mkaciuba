'use strict';

const slugify = require('slugify');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.name) {
      data.slug = `${slugify(data.name, { lower: true })}-${Math.random()}`;
    }
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.slugOverride) {
      data.slug = data.slugOverride;
    }
  },
};

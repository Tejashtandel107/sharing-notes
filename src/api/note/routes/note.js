'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::note.note', {
  config: {
    update: {
      policies: ['api::note.is-owner'],
    },
    delete: {
      policies: ['api::note.is-owner'],
    },
  },
});
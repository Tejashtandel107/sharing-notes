'use strict';

/**
 * review router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::review.review',{
    config: {
        update: {
            policies: ['api::review.is-owner'],
        },
        delete: {
            policies: ['api::review.is-owner'],
        },
    },
});

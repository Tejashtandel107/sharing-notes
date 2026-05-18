'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({

  async create(ctx) {
    const authUser = ctx.state.user;

    if (!authUser) {
      return ctx.unauthorized('Login required');
    }

    const { data } = ctx.request.body;

    if (!data.note) return ctx.badRequest('Note is required');

    // 1. Check if review already exists
    const existing = await strapi.entityService.findMany('api::review.review', {
       filters: {
        user: {
          id: authUser.id,
        },
        note: {
          documentId: data.note, // correct
        },
      },
    });

    // 2. If exists → UPDATE
    if (existing.length > 0) {
      const updated = await strapi.entityService.update(
        'api::review.review',
        existing[0].id,
        {
          data: {
            rating: data.rating,
            comment: data.comment,
          },
        }
      );

      return {
        message: 'Review updated',
        data: updated,
      };
    }

    const review = await strapi.entityService.create('api::review.review', {
      data: {
        ...data,
        user: authUser.id,
      },
    });

    return {
      message: 'Review Added',
      data: review,
    };
  },
}));
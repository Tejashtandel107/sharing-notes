'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bookmark.bookmark', ({ strapi }) => ({

  async create(ctx) {
    const authUser = ctx.state.user;

    if (!authUser) {
      return ctx.unauthorized('Login required');
    }

    const { data } = ctx.request.body;

    if (!data?.note) {
      return ctx.badRequest('Note is required');
    }

    // check existing bookmark
    const existing = await strapi.documents('api::bookmark.bookmark').findFirst({
      filters: {
        user: {
          id: {
            $eq: authUser.id,
          },
        },
        note: {
          documentId: {
            $eq: data.note,
          },
        },
      },
    });

    // REMOVE bookmark if exists (toggle OFF)
    if (existing) {
      await strapi.documents('api::bookmark.bookmark').delete({
        documentId: existing.documentId,
      });

      return {
        bookmarked: false,
        message: 'Removed from bookmarks',
      };
    }

    // CREATE bookmark (toggle ON)
    const entity = await strapi.documents('api::bookmark.bookmark').create({
      data: {
        user: authUser.id,
        note: data.note, // storing documentId directly
      },
    });

    return {
      bookmarked: true,
      message: 'Added to bookmarks',
      data: {
        documentId: entity.documentId,
      },
    };
  },

}));
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::note.note', ({ strapi }) => ({
  async create(ctx) {
    // logged in user
    const authUser = ctx.state.user;

    if (!authUser) {
      return ctx.unauthorized('You must be logged in');
    }

    const { data } = ctx.request.body;

    // attach logged in user automatically
    data.user = authUser.id;

    // create note
    const entity = await strapi.entityService.create(
      'api::note.note',
      {
        data
      }
    );

    return {
      message: 'Note Added successfully',
      data: entity
    };
  },

  async myNotes(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Login required');
    }

    const notes = await strapi.entityService.findMany('api::note.note', {
      filters: {
        user: {
          id: user.id,
        },
      },
      populate: {
        subject: true,
        reviews: true
      },
    });

    return notes;
  },

  async downloadFile(ctx) {
    const { documentId } = ctx.params;
    const user = ctx.state.user; // logged in user

    if (!user) {
      return ctx.unauthorized("Login required");
    }

    // get note
    const note = await strapi.documents("api::note.note").findOne({
      documentId,
      populate: ["file"],
    });

    if (!note) {
      return ctx.notFound("Note not found");
    }

    // check history
    const existing = await strapi.documents("api::download-history.download-history").findFirst({
      filters: {
        user: {
          id: {
            $eq: user.id,
          },
        },
        note: {
          documentId: {
            $eq: documentId,
          },
        },
      },
    });

    // if first time
    if (!existing) {
      await strapi.documents("api::download-history.download-history").create({
        data: {
          user: user.id,
          note: note.id,
        },
      });

      await strapi.documents("api::note.note").update({
        documentId,
        data: {
          downloaded: (note.downloaded || 0) + 1,
        },
      });
    }

    return {
      url: note.file?.[0]?.url,
    };
  }
}));
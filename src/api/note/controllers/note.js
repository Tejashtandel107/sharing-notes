'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::note.note', ({ strapi }) => ({

  async find(ctx) {

    const { data, meta } = await super.find(ctx);

    // Check logged in user
    const user = ctx.state.user;

    // If user not logged in remove file field
    if (!user) {
      data.forEach(item => {
        item.file = null;
        item.externalLink = null;
      });
    }

    return { data, meta };
  },

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
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Login required");
    }

    // Get note
    const note = await strapi.documents("api::note.note").findOne({
      documentId,
      populate: ["file"],
    });

    if (!note) {
      return ctx.notFound("Note not found");
    }

    // Check existing history
    const existing =
      await strapi.documents(
        "api::download-history.download-history"
      ).findFirst({
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

    // First time download only
    if (!existing) {
      // create history
      await strapi.documents(
        "api::download-history.download-history"
      ).create({
        data: {
          user: user.id,
          note: note.id,
        },
      });

      // Ensure number conversion
      const currentDownloads = Number(note.downloaded || 0);

      // update counter
      await strapi.documents("api::note.note").update({
        documentId,
        data: {
          downloaded: currentDownloads + 1,
        },
      });
    }

    return {
      url: note.file?.[0]?.url,
    };
  }
}));
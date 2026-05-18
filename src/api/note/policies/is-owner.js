module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  if (!user) return false;

  const documentId = policyContext.params.id;

  const notes = await strapi.entityService.findMany("api::note.note", {
    filters: {
      documentId: documentId,
    },
    populate: ["user"]
  });

  const note = notes[0];

  if (!note) {
    return false;
  }

  return note.user.id === user.id;
};
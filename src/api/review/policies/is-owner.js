module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  if (!user) return false;

  const documentId = policyContext.params.id;

  const reviews = await strapi.entityService.findMany("api::review.review", {
    filters: {
      documentId: documentId,
    },
    populate: ["user"]
  });

  const review = reviews[0];

  if (!review) {
    return false;
  }

  return review.user.id === user.id;
};
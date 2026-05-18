module.exports = {
  async afterCreate(event) {
    const noteId = event.params.data.note?.set?.[0]?.id;

    if (noteId) {
      await updateRating(noteId);
    }
  },
};

async function updateRating(noteId) {
  const reviews = await strapi.entityService.findMany('api::review.review', {
    filters: {
      note: noteId,
    },
    fields: ['rating'],
  });
  const total = reviews.length;

  const avg = total ? reviews.reduce((sum, item) => sum + item.rating, 0) / total : 0;
  await strapi.db.query('api::note.note').update({
    where: { id: noteId },
    data: {
      rating: Number(avg.toFixed(1)),
    },
  });
}
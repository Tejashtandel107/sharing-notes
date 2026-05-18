module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/my-notes',
      handler: 'note.myNotes',
    },
    {
      method: 'POST',
      path: '/notes/:documentId/download',
      handler: 'note.downloadFile',
    },
  ],
};
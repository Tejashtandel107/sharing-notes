const { ApplicationError } = require("@strapi/utils").errors;

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;

    const hasFile = !!data.file;
    const hasExternalLink = !!data.externalLink;

    if (!hasFile && !hasExternalLink) {
      throw new ApplicationError("Either file or externalLink is required");
    }

    if (data.isPastPaper === true && !data.paperYear) {
      throw new ApplicationError("paperYear is required when isPastPaper is true");
    }

    if (!data.subject) {
      throw new ApplicationError("Subject is required");
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;

    if ('rating' in data || 'downloaded' in data) {
      return;
    }

    const hasFile = !!data.file;
    const hasExternalLink = !!data.externalLink;

    if (!hasFile && !hasExternalLink) {
      throw new ApplicationError("Either file or externalLink is required");
    }

    if (data.isPastPaper === true && !data.paperYear) {
      throw new ApplicationError("paperYear is required when isPastPaper is true");
    }

    if (!data.subject) {
      throw new ApplicationError("Subject is required");
    }
  }
};
'use strict';
const slack = require('../../../utils/slack/slack-logger');
const { Establishment } = require('../../../models/classes/establishment');

const sendCountToSlack = async (theLoggedInUser, primaryEstablishmentId, validationDifferenceReport) => {
  const thisEstablishment = new Establishment(theLoggedInUser);

  await thisEstablishment.restore(primaryEstablishmentId, false);

  let workerCount = 0;
  if (validationDifferenceReport.new && validationDifferenceReport.new.length > 0) {
    validationDifferenceReport.new.map((est) => {
      if (est.workers && est.workers.new) {
        workerCount = workerCount + est.workers.new.length;
      }
      if (est.workers && est.workers.updated) {
        workerCount = workerCount + est.workers.updated.length;
      }
    });
  }
  if (validationDifferenceReport.updated && validationDifferenceReport.updated.length > 0) {
    validationDifferenceReport.updated.map((est) => {
      if (est.workers && est.workers.new) {
        workerCount = workerCount + est.workers.new.length;
      }
      if (est.workers && est.workers.updated) {
        workerCount = workerCount + est.workers.updated.length;
      }
    });
  }

  if (workerCount > 500)
    slack.info(
      'Large Bulk Upload',
      `${thisEstablishment.name} (ID ${thisEstablishment.nmdsId}) just did a bulk upload with a staff file containing ${workerCount} staff records.`,
    );
};

module.exports = {
  sendCountToSlack,
};

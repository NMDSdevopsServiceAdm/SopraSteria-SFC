'use strict';
const slack = require('../../../utils/slack/slack-logger');
const { Establishment } = require('../../../models/classes/establishment');

const sendCountToSlack = async (theLoggedInUser, primaryEstablishmentId, validationDiferenceReport) => {
  const thisEstablishment = new Establishment(theLoggedInUser);

  await thisEstablishment.restore(primaryEstablishmentId, false);

  let workerCount = 0;
  if (validationDiferenceReport.new && validationDiferenceReport.new.length > 0) {
    validationDiferenceReport.new.map((est) => {
      if (est.workers && est.workers.new) {
        workerCount = workerCount + est.workers.new.length;
      }
      if (est.workers && est.workers.updated) {
        workerCount = workerCount + est.workers.updated.length;
      }
    });
  }
  if (validationDiferenceReport.updated && validationDiferenceReport.updated.length > 0) {
    validationDiferenceReport.updated.map((est) => {
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

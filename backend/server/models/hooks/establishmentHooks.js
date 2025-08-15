const clearDHAWorkerAnswersOnWorkplaceChange = async (establishment, options) => {
  try {
    const models = establishment.sequelize.models;

    if (!establishment || !models) {
      return;
    }

    if (establishment.changed('staffDoDelegatedHealthcareActivities')) {
      if (establishment.staffDoDelegatedHealthcareActivities === 'No') {
        return await models.worker.clearDHAAnswerForAllWorkersInWorkplace(establishment.id, options);
      }
    }
  } catch (err) {
    console.error('error occurred while running sequelize hook', err);
  }
};

module.exports = { clearDHAWorkerAnswersOnWorkplaceChange };

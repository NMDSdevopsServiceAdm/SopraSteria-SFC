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

const clearDoDHAWorkplaceOnMainServiceChange = async (establishment, options) => {
  try {
    const models = establishment.sequelize.models;

    if (!establishment || !models) {
      return;
    }

    if (establishment.changed('MainServiceFKValue')) {
      const staffDoDelegatedHealthcareActivitiesValue = establishment.staffDoDelegatedHealthcareActivities;

      if (!staffDoDelegatedHealthcareActivitiesValue) {
        return;
      }

      const servicesModel = await models.services.getCanDoDelegatedHealthcareActivities(
        establishment.MainServiceFKValue,
      );

      if (!servicesModel.canDoDelegatedHealthcareActivities && staffDoDelegatedHealthcareActivitiesValue) {
        await models.worker.clearDHAAnswerForAllWorkersInWorkplace(establishment.id, options);

        establishment.staffDoDelegatedHealthcareActivities = null;

        const establishmentId = establishment.id;
        const username = options?.savedBy ?? '';
        const transaction = options.transaction;

        const auditEvent = {
          establishmentFk: establishmentId,
          username,
          type: 'changed',
          property: 'StaffDoDelegatedHealthcareActivities',
          event: { new: null },
        };

        await models.establishmentAudit.create(auditEvent, { transaction });
        return;
      }
    }
  } catch (err) {
    console.error('error occurred while running sequelize hook', err);
  }
};

module.exports = { clearDHAWorkerAnswersOnWorkplaceChange, clearDoDHAWorkplaceOnMainServiceChange };

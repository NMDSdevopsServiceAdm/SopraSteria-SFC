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

const clearDHAWorkplaceAnswerOnChange = async (establishment, options) => {
  try {
    const username = options?.savedBy ?? '';
    const transaction = options?.transaction;
    const models = establishment.sequelize.models;

    if (establishment.changed('staffDoDelegatedHealthcareActivities')) {
      const staffDontDoDHAAnymore = establishment.staffDoDelegatedHealthcareActivities !== 'Yes';
      const gotAnswerForStaffWhatKindActivities = establishment.staffWhatKindDelegatedHealthcareActivities !== null;

      if (staffDontDoDHAAnymore && gotAnswerForStaffWhatKindActivities) {
        establishment.staffWhatKindDelegatedHealthcareActivities = null;
        await establishment.setDelegatedHealthcareActivities([], { transaction });

        const auditEvent = {
          establishmentFk: establishment.id,
          username,
          type: 'changed',
          property: 'StaffWhatKindDelegatedHealthcareActivities',
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

const clearDoDHAWorkplaceOnMainServiceChange = async (establishment, options) => {
  try {
    const models = establishment.sequelize.models;

    if (!establishment || !models) {
      return;
    }

    if (!establishment.changed('MainServiceFKValue')) {
      return;
    }

    const staffDoDelegatedHealthcareActivitiesValue = establishment.staffDoDelegatedHealthcareActivities;

    const selectedService = await models.services.getCanDoDelegatedHealthcareActivities(
      establishment.MainServiceFKValue,
    );

    if (selectedService.canDoDelegatedHealthcareActivities) {
      return;
    }

    await models.worker.clearDHAAnswerForAllWorkersInWorkplace(establishment.id, options);

    if (!staffDoDelegatedHealthcareActivitiesValue) {
      return;
    }

    establishment.staffDoDelegatedHealthcareActivities = null;

    await clearDHAWorkplaceAnswerOnChange(establishment, options);

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
  } catch (err) {
    console.error('error occurred while running sequelize hook', err);
  }
};

module.exports = {
  clearDHAWorkerAnswersOnWorkplaceChange,
  clearDHAWorkplaceAnswerOnChange,
  clearDoDHAWorkplaceOnMainServiceChange,
};

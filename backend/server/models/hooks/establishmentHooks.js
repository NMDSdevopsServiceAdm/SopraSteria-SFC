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

module.exports = { clearDHAWorkerAnswersOnWorkplaceChange, clearDHAWorkplaceAnswerOnChange };

const unsetDHAAnswerOnJobRoleChange = async (worker, _option) => {
  try {
    const mainJobChanged = worker.changed('MainJobFkValue');
    if (!mainJobChanged) {
      return;
    }

    const newMainJob = await worker.getMainJob();
    const newJobRoleCannotDoDHA = !newMainJob?.canDoDelegatedHealthcareActivities;
    const hasAnsweredWorkerDHAQuestionBefore = worker.carryOutDelegatedHealthcareActivities !== null;

    if (newJobRoleCannotDoDHA && hasAnsweredWorkerDHAQuestionBefore) {
      worker.carryOutDelegatedHealthcareActivities = null;
    }
  } catch (err) {
    console.error('error occurred while running sequelize hook', err);
  }
};

module.exports = { unsetDHAAnswerOnJobRoleChange };

const models = require('../../../models');

const getTurnover = async function (establishmentId) {
  const establishment = await models.establishment.turnoverData(establishmentId);

  const noWorkersOrLeavers = await workplaceHasNoWorkersOrLeaves(establishment, establishmentId);
  if (noWorkersOrLeavers) {
    return noWorkersOrLeavers;
  }

  const permTemptCount = await models.worker.permAndTempCountForEstablishment(establishmentId);
  if (permTemptCount === 0) {
    return {
      stateMessage: 'no-perm-or-temp',
    };
  }

  if (establishment.LeaversValue === 'None') {
    return {
      percentOfPermTemp: 0,
    };
  }

  const leavers = await models.establishmentJobs.leaversForEstablishment(establishmentId);

  const percentOfPermTemp = leavers / permTemptCount;
  if (percentOfPermTemp > 9.95) {
    return {
      stateMessage: 'incorrect-turnover',
    };
  }

  return {
    percentOfPermTemp,
  };
};

const workplaceHasNoWorkersOrLeaves = async function (establishment, establishmentId) {
  const workerCount = await models.worker.countForEstablishment(establishmentId);
  if (!establishment || establishment.NumberOfStaffValue === 0 || workerCount !== establishment.NumberOfStaffValue) {
    return {
      stateMessage: 'mismatch-workers',
    };
  }

  if (establishment.LeaversValue === "Don't know" || !establishment.LeaversValue) {
    return {
      stateMessage: 'no-leavers',
    };
  }

  return false;
};

module.exports.getTurnover = getTurnover;

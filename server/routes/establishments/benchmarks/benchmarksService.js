const models = require('../../../models');

const getPay = async function (establishmentId) {
  const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
  if (averageHourlyPay.amount === null) {
    return {
      stateMessage: 'no-pay-data',
    };
  }

  return { value: parseInt(averageHourlyPay.amount * 100) };
};

const getQualifications = async function (establishmentId) {
  const qualifications = await models.worker.countSocialCareQualificationsAndNoQualifications(
    establishmentId,
    models.services.careProvidingStaff,
  );
  const denominator = qualifications.noQuals + qualifications.quals;
  let percentOfHigherQuals = 0;
  if (denominator > 0) {
    percentOfHigherQuals = qualifications.lvl2Quals / denominator;
    return {
      value: percentOfHigherQuals,
    };
  }

  return {
    stateMessage: 'no-qualifications-data',
  };
};

const getTurnover = async function (establishmentId) {
  const establishment = await models.establishment.turnoverData(establishmentId);

  const staffNumberIncorrectOrLeaversUnknown = await checkStaffNumberAndLeavers(establishmentId, establishment);
  if (staffNumberIncorrectOrLeaversUnknown) {
    return staffNumberIncorrectOrLeaversUnknown;
  }

  const permTemptCount = await models.worker.permAndTempCountForEstablishment(establishmentId);
  if (permTemptCount === 0) {
    return {
      stateMessage: 'no-perm-or-temp',
    };
  }

  if (establishment.LeaversValue === 'None') {
    return {
      value: 0,
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
    value: percentOfPermTemp,
  };
};

const checkStaffNumberAndLeavers = async function (establishmentId, establishment) {
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

module.exports.getPay = getPay;
module.exports.getTurnover = getTurnover;
module.exports.getQualifications = getQualifications;

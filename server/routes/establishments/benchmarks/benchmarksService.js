const models = require('../../../models');
const { Op } = require('sequelize');

const getPay = async function (establishmentId) {
  const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
  if (averageHourlyPay.amount === null) {
    return {
      stateMessage: 'no-pay-data',
    };
  }

  return { value: parseFloat((parseFloat(averageHourlyPay.amount) * 100).toFixed(0)) };
};

const getQualifications = async function (establishmentId) {
  const qualifications = await models.worker.countSocialCareQualificationsAndNoQualifications(
    establishmentId,
    models.services.careProvidingStaff,
  );
  const denominator = qualifications.noQuals + qualifications.quals;
  if (denominator <= 0) {
    return {
      stateMessage: 'no-qualifications-data',
    };
  }

  const percentOfHigherQuals = qualifications.lvl2Quals / denominator;
  return {
    value: percentOfHigherQuals,
  };
};

const getSickness = async function (establishmentId) {
  const whereClause = { DaysSickValue: 'Yes', archived: false };
  const establishmentWorkers = await models.establishment.workers(establishmentId, whereClause, ['DaysSickDays']);
  if (!establishmentWorkers) {
    return {
      stateMessage: 'no-sickness-data',
    };
  }
  const sickness = establishmentWorkers.workers.map((worker) => Number(worker.DaysSickDays)).reduce((a, b) => a + b);
  const averageSickDays = Math.round(sickness / establishmentWorkers.workers.length);
  return {
    value: averageSickDays,
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

const getComparisonGroupRankings = async function (establishmentId, benchmarksModel) {
  const cssr = await models.cssr.getCSSR(establishmentId);
  if (!cssr) return [];
  return await benchmarksModel.findAll({
    attributes: { exclude: ['CssrID', 'MainServiceFK'] },
    where: {
      CssrID: cssr,
      EstablishmentFK: {
        [Op.not]: [establishmentId],
      },
    },
    include: [
      {
        attributes: ['id', 'reportingID'],
        model: models.services,
        as: 'BenchmarkToService',
        include: [
          {
            attributes: ['id'],
            model: models.establishment,
            where: {
              id: establishmentId,
            },
            as: 'establishmentsMainService',
            required: true,
          },
        ],
        required: true,
      },
    ],
  });
};

module.exports.getPay = getPay;
module.exports.getQualifications = getQualifications;
module.exports.getSickness = getSickness;
module.exports.getTurnover = getTurnover;
module.exports.getComparisonGroupRankings = getComparisonGroupRankings;

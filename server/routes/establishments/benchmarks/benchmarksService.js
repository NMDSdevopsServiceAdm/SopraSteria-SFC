const models = require('../../../models');
const { Op } = require('sequelize');

const getPay = async function (params) {
  const averageHourlyPay = await models.worker.averageHourlyPay(params);

  if (!averageHourlyPay.amount) {
    return {
      stateMessage: 'no-pay-data',
    };
  }

  const amount =
    params.annualOrHourly === 'Annually'
      ? parseFloat(averageHourlyPay.amount)
      : parseFloat(averageHourlyPay.amount) * 100;

  return { value: parseFloat(amount.toFixed(0)) };
};

const getQualifications = async function ({ establishmentId }) {
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

const getSickness = async function ({ establishmentId }) {
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

const getTurnover = async function ({ establishmentId }) {
  const response = await vacanciesAndLeavers(establishmentId, 'LeaversValue');

  if (response.stateMessage) return { stateMessage: response.stateMessage };
  if (response.value) return { value: 0 };

  const percentOfPermTemp = response.noOfProperty / response.permTempCount;

  if (percentOfPermTemp > 9.95) {
    return {
      stateMessage: 'incorrect-turnover',
    };
  }

  return {
    value: percentOfPermTemp,
  };
};

const getVacancies = async function ({ establishmentId }) {
  const response = await vacanciesAndLeavers(establishmentId, 'VacanciesValue');

  if (response.stateMessage) return { stateMessage: response.stateMessage };
  if (response.value) return { value: 0 };

  const percentOfPermTemp = response.noOfProperty / (response.permTempCount + response.noOfProperty);

  return {
    value: percentOfPermTemp,
  };
};

const vacanciesAndLeavers = async (establishmentId, leaversOrVacancies) => {
  const establishment = await models.establishment.turnoverAndVacanciesData(establishmentId);

  const staffNumberIncorrectOrVacanciesUnknown = await checkStaffNumbers(
    establishmentId,
    establishment,
    leaversOrVacancies,
  );

  if (staffNumberIncorrectOrVacanciesUnknown) return staffNumberIncorrectOrVacanciesUnknown;

  const permTempCount = await models.worker.permAndTempCountForEstablishment(establishmentId);

  if (permTempCount === 0) {
    return { stateMessage: 'no-perm-or-temp' };
  }

  if (establishment[leaversOrVacancies] === 'None') {
    return {
      value: 'None',
    };
  }

  const attribute = leaversOrVacancies === 'LeaversValue' ? 'Leavers' : 'Vacancies';

  const noOfProperty = await models.establishmentJobs.leaversOrVacanciesForEstablishment(establishmentId, attribute);

  return { noOfProperty, permTempCount };
};

const checkStaffNumbers = async function (establishmentId, establishment, leaversOrVacancies) {
  const workerCount = await models.worker.countForEstablishment(establishmentId);

  if (!establishment || establishment.NumberOfStaffValue === 0 || workerCount !== establishment.NumberOfStaffValue) {
    return {
      stateMessage: 'mismatch-workers',
    };
  }

  if (establishment[leaversOrVacancies] === "Don't know" || !establishment[leaversOrVacancies]) {
    return {
      stateMessage: leaversOrVacancies === 'LeaversValue' ? 'no-leavers' : 'no-vacancies',
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
      CssrID: cssr.id,
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

const getComparisonData = async function (benchmarksModel, establishmentId, mainService, attributes, mainJob) {
  const cssr = await models.cssr.getCSSR(establishmentId);
  if (!cssr) return {};

  const where = mainJob ? { MainJobRole: mainJob } : {};
  return await benchmarksModel.findOne({
    attributes: ['LocalAuthorityArea', 'MainServiceFK', 'BaseEstablishments', ...attributes],
    where: {
      LocalAuthorityArea: cssr.id,
      MainServiceFK: mainService,
      ...where,
    },
  });
};

module.exports = {
  getPay,
  getQualifications,
  getSickness,
  getTurnover,
  getVacancies,
  getComparisonGroupRankings,
  getComparisonData,
};

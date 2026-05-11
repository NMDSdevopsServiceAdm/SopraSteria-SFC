const dayjs = require('dayjs');

const createEmptySummaryRow = () => ({
  total: 0,
  expired: 0,
  expiringSoon: 0,
  upToDate: 0,
  missing: 0,
});

const buildTrainingCategorySummary = (establishmentsWithTrainingRecords) => {
  const allTrainingRecords = listAllExistingAndMissingTrainings(establishmentsWithTrainingRecords);

  const categoryMap = {};

  const statusFieldMap = {
    Expired: 'expired',
    'Expiring soon': 'expiringSoon',
    'Up-to-date': 'upToDate',
    Missing: 'missing',
  };

  allTrainingRecords.forEach((training) => {
    const categoryName = training.category;

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = {
        trainingCategory: categoryName,
        mandatory: training.isMandatory,

        ...createEmptySummaryRow(),
      };
    }

    const category = categoryMap[categoryName];

    category.total++;

    const field = statusFieldMap[training.status];

    if (field) {
      category[field]++;
    }
  });

  const rows = Object.values(categoryMap);

  const totals = rows.reduce(
    (acc, row) => {
      acc.total += row.total;
      acc.expired += row.expired;
      acc.expiringSoon += row.expiringSoon;
      acc.upToDate += row.upToDate;
      acc.missing += row.missing;

      return acc;
    },
    {
      trainingCategory: 'Total',
      mandatory: '-',
      ...createEmptySummaryRow(),
    },
  );

  return [...rows, totals];
};

const convertEachWorkerTrainingBreakdown = (worker) => {
  const expiredTrainingCount = parseInt(worker.get('expiredTrainingCount'));
  const expiredMandatoryTrainingCount = parseInt(worker.get('expiredMandatoryTrainingCount'));

  const expiringTrainingCount = parseInt(worker.get('expiringTrainingCount'));
  const expiringMandatoryTrainingCount = parseInt(worker.get('expiringMandatoryTrainingCount'));

  const trainingCount = parseInt(worker.get('trainingCount'));
  const mandatoryTrainingCount = parseInt(worker.get('mandatoryTrainingCount'));
  const nonMandatoryTrainingCount = trainingCount - mandatoryTrainingCount;

  const upToDateMandatoryTrainingCount =
    mandatoryTrainingCount - expiredMandatoryTrainingCount - expiringMandatoryTrainingCount;
  const upToDateTrainingCount = trainingCount - expiringTrainingCount - expiredTrainingCount;
  const upToDateNonMandatoryTrainingCount = upToDateTrainingCount - upToDateMandatoryTrainingCount;

  return {
    name: numberCheck(worker.get('NameOrIdValue')),
    trainingCount: parseInt(worker.get('trainingCount')),
    mandatoryTrainingCount,
    nonMandatoryTrainingCount,
    qualificationCount: parseInt(worker.get('qualificationCount')),
    expiredTrainingCount,
    expiredMandatoryTrainingCount,
    expiredNonMandatoryTrainingCount: expiredTrainingCount - expiredMandatoryTrainingCount,
    expiringTrainingCount,
    expiringMandatoryTrainingCount,
    expiringNonMandatoryTrainingCount: expiringTrainingCount - expiringMandatoryTrainingCount,
    missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
    upToDateTrainingCount,
    upToDateMandatoryTrainingCount,
    upToDateNonMandatoryTrainingCount,
  };
};

exports.convertEachWorkerTrainingBreakdown = convertEachWorkerTrainingBreakdown;

const convertWorkerWithCareCertificateStatus = (worker) => {
  return {
    workerId: numberCheck(worker.get('NameOrIdValue')),
    jobRole: worker.mainJob.title,
    status: worker.get('CareCertificateValue') ? worker.get('CareCertificateValue') : '',
  };
};

exports.convertWorkersWithCareCertificateStatus = (establishments) => {
  return establishments.map((establishment) => {
    return {
      establishmentName: establishment.get('NameValue'),
      workers: establishment.workers.map((worker) => {
        return convertWorkerWithCareCertificateStatus(worker);
      }),
    };
  });
};

exports.convertWorkerTrainingBreakdowns = (rawWorkerTrainingBreakdowns) => {
  return rawWorkerTrainingBreakdowns.map((trainingBreakdown) => {
    return convertEachWorkerTrainingBreakdown(trainingBreakdown);
  });
};

const convertWorkerTrainingRecords = (workers, expiresSoonAlertDate) => {
  return workers.map((worker) => {
    const mandatoryTrainingCategories = worker?.get('mandatoryTrainingCategories') ?? [];

    return {
      workerId: numberCheck(worker.NameOrIdValue),
      jobRole: worker.mainJob.title,
      isInLongTermAbsence: worker.LongTermAbsence ? 'Yes' : 'No',
      mandatoryTraining: mandatoryTrainingCategories,
      missingMandatoryTrainings: listMissingMandatoryTrainings(worker),
      trainingRecords: convertIndividualWorkerTrainingRecords(
        worker.workerTraining,
        expiresSoonAlertDate,
        mandatoryTrainingCategories,
      ),
    };
  });
};

const convertIndividualWorkerTrainingRecords = (
  workerTraining,
  expiresSoonAlertDate,
  mandatoryTrainingCategories = [],
) => {
  return workerTraining.map((trainingRecord) => {
    const expiryDate = trainingRecord.expires ? new Date(trainingRecord.expires) : null;
    const dateCompleted = trainingRecord.completed ? new Date(trainingRecord.completed) : null;
    const isMandatory = mandatoryTrainingCategories.includes(trainingRecord.category.category) ? 'Yes' : 'No';
    const trainingCertificateUploaded = trainingRecord.trainingCertificatesCount > 0 ? 'Yes' : 'No';

    return {
      category: trainingRecord.category.category,
      categoryFK: trainingRecord.categoryFk,
      trainingName: trainingRecord.title,
      expiryDate,
      status: getTrainingRecordStatus(expiryDate, expiresSoonAlertDate),
      dateCompleted,
      accredited: trainingRecord.accredited,

      isMandatory,
      validityPeriodInMonth: trainingRecord.validityPeriodInMonth,
      trainingCertificateUploaded,
      deliveredBy: trainingRecord.deliveredBy,
      trainingProviderName: trainingRecord.trainingProviderName,
      howWasItDelivered: trainingRecord.howWasItDelivered,
    };
  });
};

const getTrainingRecordStatus = (expiryDate, expiresSoonAlertDate) => {
  if (expiryDate === '') {
    return 'Up-to-date';
  }

  const currentDate = dayjs();
  const expiringSoonDate = dayjs().add(parseInt(expiresSoonAlertDate), 'days');

  if (dayjs(expiryDate).isBefore(currentDate, 'day')) {
    return 'Expired';
  }
  if (dayjs(expiryDate).isBefore(expiringSoonDate, 'day')) {
    return 'Expiring soon';
  }
  return 'Up-to-date';
};

exports.convertTrainingForEstablishments = (rawEstablishments) => {
  return rawEstablishments.map((establishment) => {
    return {
      name: numberCheck(establishment.NameValue),
      workerRecords: convertWorkerTrainingRecords(establishment.workers, establishment.expiresSoonAlertDate),
    };
  });
};

const convertIndividualWorkerQualifications = (worker) => {
  return worker.qualifications.map((qualification) => {
    return {
      workerName: numberCheck(worker.get('NameOrIdValue')),
      jobRole: worker.mainJob.title,
      qualificationType: qualification.qualification.group,
      qualificationName: qualification.qualification.title,
      qualificationLevel: qualification.qualification.level,
      yearAchieved: qualification.get('Year'),
    };
  });
};

const convertWorkerQualifications = (rawWorkerQualifications) => {
  return rawWorkerQualifications.workers.reduce((convertedWorkerQualifications, worker) => {
    return convertedWorkerQualifications.concat(convertIndividualWorkerQualifications(worker));
  }, []);
};

exports.convertQualificationsForEstablishments = (rawEstablishments) => {
  return rawEstablishments.map((establishment) => {
    return {
      name: numberCheck(establishment.NameValue),
      qualifications: convertWorkerQualifications(establishment),
    };
  });
};

const numberCheck = (value) => {
  const isNumber = /^\d+$/.test(value);

  return isNumber ? parseInt(value) : value;
};

exports.getTrainingTotals = (workers) => {
  let expiredTotalRecords = 0;
  let expiredTotalMandatory = 0;
  let expiringTotalRecords = 0;
  let expiringTotalMandatory = 0;
  let totalRecords = 0;
  let totalMandatoryRecords = 0;
  let missingRecords = 0;

  for (let worker of workers) {
    expiredTotalRecords += worker.expiredTrainingCount;
    expiredTotalMandatory += worker.expiredMandatoryTrainingCount;
    expiringTotalRecords += worker.expiringTrainingCount;
    expiringTotalMandatory += worker.expiringMandatoryTrainingCount;
    totalRecords += worker.trainingCount;
    totalMandatoryRecords += worker.mandatoryTrainingCount;
    missingRecords += worker.missingMandatoryTrainingCount;
  }

  const upToDateTotalRecords = totalRecords - expiringTotalRecords - expiredTotalRecords;
  const upToDateTotalMandatory = totalMandatoryRecords - expiringTotalMandatory - expiredTotalMandatory;
  const upToDateTotalNonMandatory = upToDateTotalRecords - upToDateTotalMandatory;

  return {
    total: {
      mandatory: totalMandatoryRecords,
      nonMandatory: totalRecords - totalMandatoryRecords,
      totalRecords,
    },
    upToDate: {
      total: upToDateTotalRecords,
      mandatory: upToDateTotalMandatory,
      nonMandatory: upToDateTotalNonMandatory,
    },
    expiringSoon: {
      mandatory: expiringTotalMandatory,
      nonMandatory: expiringTotalRecords - expiringTotalMandatory,
      total: expiringTotalRecords,
    },
    expired: {
      mandatory: expiredTotalMandatory,
      nonMandatory: expiredTotalRecords - expiredTotalMandatory,
      total: expiredTotalRecords,
    },
    missing: missingRecords,
  };
};

exports.getTotalsForAllWorkplaces = (establishments) => {
  return establishments.reduce((a, b) => {
    return {
      totals: {
        upToDate: {
          total: a.totals.upToDate.total + b.totals.upToDate.total,
          mandatory: a.totals.upToDate.mandatory + b.totals.upToDate.mandatory,
          nonMandatory: a.totals.upToDate.nonMandatory + b.totals.upToDate.nonMandatory,
        },
        expiringSoon: {
          total: a.totals.expiringSoon.total + b.totals.expiringSoon.total,
          mandatory: a.totals.expiringSoon.mandatory + b.totals.expiringSoon.mandatory,
          nonMandatory: a.totals.expiringSoon.nonMandatory + b.totals.expiringSoon.nonMandatory,
        },
        expired: {
          total: a.totals.expired.total + b.totals.expired.total,
          mandatory: a.totals.expired.mandatory + b.totals.expired.mandatory,
          nonMandatory: a.totals.expired.nonMandatory + b.totals.expired.nonMandatory,
        },
        missing: a.totals.missing + b.totals.missing,
      },
    };
  });
};

exports.numberCheck = numberCheck;
exports.getTrainingRecordStatus = getTrainingRecordStatus;

exports.buildWorkerTrainingBreakdownWithWorkplaceInfo = async (rawEstablishmentTrainingBreakdowns) => {
  const establishmentMandatoryTrainingCounts = await Promise.all(
    rawEstablishmentTrainingBreakdowns.rows.map((establishment) => establishment.countMandatoryTraining()),
  );
  const eachEstablishmentHasMandatoryTraining = establishmentMandatoryTrainingCounts.map((count) => count > 0);

  const workerTrainingBreakdownsWithWorkplaceInfo = rawEstablishmentTrainingBreakdowns.rows.flatMap(
    (establishment, index) => {
      const workerBreakdowns = establishment.workers.map(convertEachWorkerTrainingBreakdown);
      return workerBreakdowns.map((workerBreakDown) => ({
        ...workerBreakDown,
        workplaceId: establishment.id,
        workplaceName: establishment.NameValue,
        workplaceHasMandatoryTraining: eachEstablishmentHasMandatoryTraining[index],
      }));
    },
  );

  return workerTrainingBreakdownsWithWorkplaceInfo;
};

const listMissingMandatoryTrainings = (workerWithTrainingRecords) => {
  const categoryNames = workerWithTrainingRecords?.get('mandatoryTrainingCategories') ?? [];
  const trainingRecords = workerWithTrainingRecords?.workerTraining ?? [];

  const missingCategories = categoryNames.filter(
    (categoryName) => !trainingRecords.some((record) => record?.category?.category === categoryName),
  );

  return missingCategories.map((categoryName) => ({ category: categoryName, status: 'Missing', isMandatory: 'Yes' }));
};

exports.listMissingMandatoryTrainings = listMissingMandatoryTrainings;

const listAllExistingAndMissingTrainings = (establishmentsWithTrainingRecords) => {
  return establishmentsWithTrainingRecords.flatMap((establishment) => {
    return establishment.workerRecords.flatMap((worker) => {
      const existingRecords = worker.trainingRecords;
      const missingMandatoryTrainings = worker.missingMandatoryTrainings;
      return [...existingRecords, ...missingMandatoryTrainings].map((training) => {
        return {
          ...training,
          workplaceName: establishment.name,
          workerNameOrId: worker.workerId,
          mainJobRole: worker.jobRole,
          isInLongTermAbsence: worker.isInLongTermAbsence,
        };
      });
    });
  });
};

exports.listAllExistingAndMissingTrainings = listAllExistingAndMissingTrainings;
exports.buildTrainingCategorySummary = buildTrainingCategorySummary;

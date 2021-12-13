const convertWorkerTrainingBreakdown = (worker) => {
  const expiredTrainingCount = parseInt(worker.get('expiredTrainingCount'));
  const expiredMandatoryTrainingCount = parseInt(worker.get('expiredMandatoryTrainingCount'));
  const expiringTrainingCount = parseInt(worker.get('expiringTrainingCount'));
  const expiringMandatoryTrainingCount = parseInt(worker.get('expiringMandatoryTrainingCount'));

  return {
    name: numberCheck(worker.get('NameOrIdValue')),
    trainingCount: parseInt(worker.get('trainingCount')),
    qualificationCount: parseInt(worker.get('qualificationCount')),
    expiredTrainingCount,
    expiredMandatoryTrainingCount,
    expiredNonMandatoryTrainingCount: expiredTrainingCount - expiredMandatoryTrainingCount,
    expiringTrainingCount,
    expiringMandatoryTrainingCount,
    expiringNonMandatoryTrainingCount: expiringTrainingCount - expiringMandatoryTrainingCount,
    missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
    mandatoryTrainingCount: parseInt(worker.get('mandatoryTrainingCount')),
  };
};

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
    return convertWorkerTrainingBreakdown(trainingBreakdown);
  });
};

const convertWorkerTrainingRecords = (workers, expiresSoonAlertDate) => {
  return workers.map((worker) => {
    return {
      workerId: numberCheck(worker.get('NameOrIdValue')),
      jobRole: worker.mainJob.title,
      longTermAbsence: worker.get('LongTermAbsence') ? worker.get('LongTermAbsence') : '',
      mandatoryTraining: worker.get('mandatoryTrainingCategories') ? worker.get('mandatoryTrainingCategories') : [],
      trainingRecords: convertIndividualWorkerTrainingRecords(worker.workerTraining, expiresSoonAlertDate),
    };
  });
};

const convertIndividualWorkerTrainingRecords = (workerTraining, expiresSoonAlertDate) => {
  return workerTraining.map((trainingRecord) => {
    const expiryDate = trainingRecord.get('Expires') ? new Date(trainingRecord.get('Expires')) : '';
    const dateCompleted = trainingRecord.get('Completed') ? new Date(trainingRecord.get('Completed')) : '';

    return {
      category: trainingRecord.get('category').category,
      categoryFK: trainingRecord.get('CategoryFK'),
      trainingName: trainingRecord.get('Title') ? trainingRecord.get('Title') : '',
      expiryDate,
      status: getTrainingRecordStatus(expiryDate, expiresSoonAlertDate),
      dateCompleted,
      accredited: trainingRecord.get('Accredited') ? trainingRecord.get('Accredited') : '',
    };
  });
};

const getTrainingRecordStatus = (expiryDate, expiresSoonAlertDate) => {
  if (expiryDate === '') {
    return 'Up-to-date';
  }

  const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
  const expiringSoonDate = new Date(new Date().setHours(0, 0, 0, 0));
  expiringSoonDate.setDate(currentDate.getDate() + parseInt(expiresSoonAlertDate));

  if (expiryDate < currentDate) {
    return 'Expired';
  }
  if (expiryDate < expiringSoonDate) {
    return 'Expiring soon';
  }
  return 'Up-to-date';
};

exports.convertTrainingForEstablishments = (rawEstablishments) => {
  return rawEstablishments.map((establishment) => {
    const workplaceNameAsNumber = /^\d+$/.test(establishment.NameValue);
    return {
      name: workplaceNameAsNumber ? parseInt(workplaceNameAsNumber) : establishment.NameValue,
      workerRecords: convertWorkerTrainingRecords(establishment.workers, establishment.get('ExpiresSoonAlertDate')),
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

const convertWorkerTrainingBreakdown = (worker) => {
  const expiredTrainingCount = parseInt(worker.get('expiredTrainingCount'));
  const expiredMandatoryTrainingCount = parseInt(worker.get('expiredMandatoryTrainingCount'));
  const expiringTrainingCount = parseInt(worker.get('expiringTrainingCount'));
  const expiringMandatoryTrainingCount = parseInt(worker.get('expiringMandatoryTrainingCount'));

  const workerIdAsNumber = parseInt(worker.get('NameOrIdValue'));

  return {
    name: workerIdAsNumber ? workerIdAsNumber : worker.get('NameOrIdValue'),
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

const convertWorkerWithCareCertificate = (worker) => {
  return {
    workerId: worker.get('NameOrIdValue'),
    jobRole: worker.mainJob.title,
    status: worker.get('CareCertificateValue'),
  };
};

exports.convertWorkerWithCareCertificate = (rawWorkersWithCareCertificate) => {
  return rawWorkersWithCareCertificate.map((worker) => {
    return convertWorkerWithCareCertificate(worker);
  });
};

exports.convertWorkerTrainingBreakdowns = (rawWorkerTrainingBreakdowns) => {
  return rawWorkerTrainingBreakdowns.map((trainingBreakdown) => {
    return convertWorkerTrainingBreakdown(trainingBreakdown);
  });
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

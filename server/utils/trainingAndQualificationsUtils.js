exports.convertWorkerTrainingBreakdown = (worker) => {
  return {
    name: worker.get('NameOrIdValue'),
    trainingCount: parseInt(worker.get('trainingCount')),
    qualificationCount: parseInt(worker.get('qualificationCount')),
    expiredTrainingCount: parseInt(worker.get('expiredTrainingCount')),
    expiredMandatoryTrainingCount: parseInt(worker.get('expiredMandatoryTrainingCount')),
    expiredNonMandatoryTrainingCount: parseInt(worker.get('expiredNonMandatoryTrainingCount')),
    expiringTrainingCount: parseInt(worker.get('expiringTrainingCount')),
    expiringMandatoryTrainingCount: parseInt(worker.get('expiringMandatoryTrainingCount')),
    expiringNonMandatoryTrainingCount: parseInt(worker.get('expiringNonMandatoryTrainingCount')),
    missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
    mandatoryTrainingCount: parseInt(worker.get('mandatoryTrainingCount')),
  };
};

exports.getTrainingTotals = (workers) => {
  const expiredTotalRecords = workers.map((worker) => worker.expiredTrainingCount).reduce((a, b) => a + b, 0);
  const expiredTotalMandatory = workers
    .map((worker) => worker.expiredMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);

  const expiringTotalRecords = workers.map((worker) => worker.expiringTrainingCount).reduce((a, b) => a + b, 0);
  const expiringTotalMandatory = workers
    .map((worker) => worker.expiringMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);

  const totalRecords = workers.map((worker) => worker.trainingCount).reduce((a, b) => a + b, 0);
  const totalMandatoryRecords = workers.map((worker) => worker.mandatoryTrainingCount).reduce((a, b) => a + b, 0);

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
    missing: workers.map((worker) => worker.missingMandatoryTrainingCount).reduce((a, b) => a + b, 0),
  };
};

const models = require('../../../models');

const getRawDataForTrainingAndQualificationsReport = async (establishmentId, isParent = false) => {
  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(
    establishmentId,
    true,
    isParent,
  );
  const rawEstablishmentWithTrainingRecords = await models.establishment.getEstablishmentTrainingRecords(
    establishmentId,
    isParent,
  );
  const rawEstablishmentCareCertificateStatus = await models.establishment.getWorkersWithCareCertificateStatus(
    establishmentId,
    isParent,
  );

  return {
    rawEstablishmentTrainingBreakdowns,
    rawEstablishmentWithTrainingRecords,
    rawEstablishmentCareCertificateStatus,
  };
};
exports.getRawDataForTrainingAndQualificationsReport = getRawDataForTrainingAndQualificationsReport;

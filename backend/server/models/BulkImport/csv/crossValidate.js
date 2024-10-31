const models = require('../../../models');

const MAIN_JOB_ROLE_ERROR = () => 1280;

const crossValidate = async (csvWorkerSchemaErrors, myEstablishments, JSONWorker) => {
  if (workerNotChanged(JSONWorker)) {
    return false;
  }

  const isCqcRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

  _crossValidateMainJobRole(csvWorkerSchemaErrors, isCqcRegulated, JSONWorker);
};

const crossValidateTransferStaffRecord = async (csvWorkerSchemaErrors, myAPIEstablishments, myEstablishments) => {
  const relatedEstablishmentIds = myEstablishments.map((establishment) => establishment.id);

  for (const establishment of Object.values(myAPIEstablishments)) {
    if (!establishment._workerEntities) {
      continue;
    }

    for (const workerEntity of Object.values(establishment._workerEntities)) {
      if (workerEntity.transferStaffRecord && workerEntity.status === 'UPDATE') {
        const newWorkplaceLocalRef = workerEntity.transferStaffRecord;
        const newWorkplaceId = await getNewWorkplaceId(newWorkplaceLocalRef, relatedEstablishmentIds);
        // TODO: add error to csvWorkerSchemaErrors if newWorkplaceId is null;
        workerEntity._newWorkplaceId = newWorkplaceId;
      }
    }
  }
};

const getNewWorkplaceId = async (newWorkplaceLocalRef, relatedEstablishmentIds) => {
  const newWorkplaceFound = await models.establishment.findOne({
    where: {
      LocalIdentifierValue: newWorkplaceLocalRef,
      id: relatedEstablishmentIds,
    },
  });
  if (newWorkplaceFound) {
    return newWorkplaceFound.id;
  }

  return null;
};

const _crossValidateMainJobRole = (csvWorkerSchemaErrors, isCqcRegulated, JSONWorker) => {
  if (!isCqcRegulated && JSONWorker.mainJobRoleId === 4) {
    csvWorkerSchemaErrors.unshift({
      worker: JSONWorker.uniqueWorkerId,
      name: JSONWorker.localId,
      lineNumber: JSONWorker.lineNumber,
      errCode: MAIN_JOB_ROLE_ERROR(),
      errType: 'MAIN_JOB_ROLE_ERROR',
      source: JSONWorker.mainJobRoleId,
      column: 'MAINJOBROLE',
      error:
        'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role',
    });
  }
};

const _isCQCRegulated = async (myEstablishments, JSONWorker) => {
  const workerEstablishment = myEstablishments.find(
    (establishment) => JSONWorker.establishmentKey === establishment.key,
  );

  if (workerEstablishment) {
    switch (workerEstablishment.status) {
      case 'NEW':
      case 'UPDATE':
        return workerEstablishment.regType === 2;
      case 'UNCHECKED':
      case 'NOCHANGE':
        return await _checkEstablishmentRegulatedInDatabase(workerEstablishment.id);
      case 'DELETE':
        break;
    }
  }
};

const _checkEstablishmentRegulatedInDatabase = async (establishmentId) => {
  const establishment = await models.establishment.findbyId(establishmentId);
  return establishment.isRegulated;
};

const workerNotChanged = (JSONWorker) => !['NEW', 'UPDATE'].includes(JSONWorker.status);

module.exports = {
  crossValidate,
  _crossValidateMainJobRole,
  crossValidateTransferStaffRecord,
  _isCQCRegulated,
};

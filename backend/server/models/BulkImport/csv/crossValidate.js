const models = require('../../../models');

const MAIN_JOB_ROLE_ERROR = () => 1280;

const TRANSFERSTAFFRECORD_ERROR = () => 1400;

const crossValidate = async (csvWorkerSchemaErrors, myEstablishments, JSONWorker) => {
  if (workerNotChanged(JSONWorker)) {
    return false;
  }

  const isCqcRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

  _crossValidateMainJobRole(csvWorkerSchemaErrors, isCqcRegulated, JSONWorker);
};

const crossValidateTransferStaffRecord = async (
  csvWorkerSchemaErrors,
  myAPIEstablishments,
  myEstablishments,
  myJSONWorkers,
) => {
  const relatedEstablishmentIds = myEstablishments.map((establishment) => establishment.id);

  for (const JSONworker of myJSONWorkers) {
    if (JSONworker.status !== 'UPDATE' || !JSONworker.transferStaffRecord) {
      continue;
    }

    await _crossValidateTransferStaffRecordForWorker(
      csvWorkerSchemaErrors,
      relatedEstablishmentIds,
      myAPIEstablishments,
      JSONworker,
    );
  }
};

const _crossValidateTransferStaffRecordForWorker = async (
  csvWorkerSchemaErrors,
  relatedEstablishmentIds,
  myAPIEstablishments,
  JSONworker,
) => {
  const oldWorkplaceLocalRef = JSONworker.localId;
  const newWorkplaceLocalRef = JSONworker.transferStaffRecord;
  const newWorkplaceId = await _getNewWorkplaceId(newWorkplaceLocalRef, relatedEstablishmentIds);

  if (newWorkplaceId === null) {
    _addErrorForNewWorkplaceNotFound(csvWorkerSchemaErrors, JSONworker);
    return;
  }

  const sameLocalIdExistInNewWorkplace = await _checkDuplicateLocalIdInNewWorkplace(
    newWorkplaceId,
    JSONworker.uniqueWorkerId,
  );

  if (sameLocalIdExistInNewWorkplace) {
    _addErrorForSameLocalIdExistInNewWorkplace(csvWorkerSchemaErrors, JSONworker);
    return;
  }

  const keyInApiEstablishments = JSONworker.uniqueWorkerId.replace(/\s/g, '');
  const workerEntity = myAPIEstablishments[oldWorkplaceLocalRef]._workerEntities[keyInApiEstablishments];
  workerEntity._newWorkplaceId = newWorkplaceId;
};

const _getNewWorkplaceId = async (newWorkplaceLocalRef, relatedEstablishmentIds) => {
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

const _checkDuplicateLocalIdInNewWorkplace = async (newWorkplaceId, uniqueWorkerId) => {
  const uniqueWorkerIdHasWhitespace = /\s/g.test(uniqueWorkerId);

  if (uniqueWorkerIdHasWhitespace) {
    // Handle special cases when uniqueWorkerId includes whitespace.
    // As the legacy code does a /\s/g replacement in same places, we need to consider the case of local id collision with whitespaces stripped.
    const allWorkersInNewWorkplace = await models.worker.findAll({
      attributes: ['LocalIdentifierValue'],
      where: {
        establishmentFk: newWorkplaceId,
      },
      raw: true,
    });
    const allRefsWithoutWhitespaces = allWorkersInNewWorkplace
      .filter((worker) => worker?.LocalIdentifierValue)
      .map((worker) => worker.LocalIdentifierValue.replace(/\s/g, ''));

    return allRefsWithoutWhitespaces.includes(uniqueWorkerId.replace(/\s/g, ''));
  }

  const sameLocalIdFound = await models.worker.findOne({
    where: {
      LocalIdentifierValue: uniqueWorkerId,
      establishmentFk: newWorkplaceId,
    },
  });
  return !!sameLocalIdFound;
};

const _addErrorForNewWorkplaceNotFound = (csvWorkerSchemaErrors, JSONWorker) => {
  csvWorkerSchemaErrors.unshift({
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    errCode: TRANSFERSTAFFRECORD_ERROR(),
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    source: JSONWorker.transferStaffRecord,
    column: 'TRANSFERSTAFFRECORD',
    error: 'Cannot find an existing workplace with the localId provided in TRANSFERSTAFFRECORD',
  });
};

const _addErrorForSameLocalIdExistInNewWorkplace = (csvWorkerSchemaErrors, JSONWorker) => {
  csvWorkerSchemaErrors.unshift({
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    errCode: TRANSFERSTAFFRECORD_ERROR(),
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    source: JSONWorker.uniqueWorkerId,
    column: 'TRANSFERSTAFFRECORD',
    error: 'The UNIQUEWORKERID for this worker is already used in the new workplace given in TRANSFERSTAFFRECORD.',
  });
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

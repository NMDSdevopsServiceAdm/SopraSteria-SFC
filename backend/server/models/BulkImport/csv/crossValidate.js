const { chain } = require('lodash');
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
  return establishment?.isRegulated;
};

const workerNotChanged = (JSONWorker) => !['NEW', 'UPDATE'].includes(JSONWorker.status);

const crossValidateTransferStaffRecord = async (
  csvWorkerSchemaErrors,
  myAPIEstablishments,
  myEstablishments,
  myJSONWorkers,
) => {
  const relatedEstablishmentIds = myEstablishments.map((establishment) => establishment.id);

  const allMovingWorkers = myJSONWorkers.filter(isMovingToNewWorkplace);
  const allNewWorkers = myJSONWorkers.filter((JSONWorker) => JSONWorker.status === 'NEW');

  _crossValidateWorkersWithSameRefMovingToSameWorkplace(csvWorkerSchemaErrors, allMovingWorkers, allNewWorkers);

  for (const JSONWorker of allMovingWorkers) {
    const newWorkplaceId = await _validateTransferIsPossible(
      csvWorkerSchemaErrors,
      relatedEstablishmentIds,
      JSONWorker,
    );

    if (newWorkplaceId) {
      _addNewWorkplaceIdToWorkerEntity(myAPIEstablishments, JSONWorker, newWorkplaceId);
    }
  }
};

const isMovingToNewWorkplace = (JSONWorker) => {
  return JSONWorker.status === 'UPDATE' && JSONWorker.transferStaffRecord;
};

const _validateTransferIsPossible = async (csvWorkerSchemaErrors, relatedEstablishmentIds, JSONWorker) => {
  const newWorkplaceLocalRef = JSONWorker.transferStaffRecord;
  const newWorkplaceId = await _getNewWorkplaceId(newWorkplaceLocalRef, relatedEstablishmentIds);

  if (newWorkplaceId === null) {
    _addErrorForNewWorkplaceNotFound(csvWorkerSchemaErrors, JSONWorker);
    return;
  }

  const sameLocalIdExistInNewWorkplace = await models.worker.findOneWithConflictingLocalRef(
    newWorkplaceId,
    JSONWorker.uniqueWorkerId,
  );

  if (sameLocalIdExistInNewWorkplace) {
    _addErrorForSameLocalIdExistInNewWorkplace(csvWorkerSchemaErrors, JSONWorker);
    return;
  }

  if (_workerPassedAllValidations(csvWorkerSchemaErrors, JSONWorker)) {
    return newWorkplaceId;
  }
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

const _workerPassedAllValidations = (csvWorkerSchemaErrors, JSONWorker) => {
  const errorForThisWorker = csvWorkerSchemaErrors.find(
    (error) => error?.lineNumber === JSONWorker.lineNumber && error?.errType === 'TRANSFERSTAFFRECORD_ERROR',
  );

  return !errorForThisWorker;
};

const _addNewWorkplaceIdToWorkerEntity = (myAPIEstablishments, JSONWorker, newWorkplaceId) => {
  const oldWorkplaceKey = JSONWorker.localId.replace(/\s/g, '');
  const workerEntityKey = JSONWorker.uniqueWorkerId.replace(/\s/g, '');

  const workerEntity = myAPIEstablishments[oldWorkplaceKey].theWorker(workerEntityKey);

  workerEntity._newWorkplaceId = newWorkplaceId;
};

const _addErrorForNewWorkplaceNotFound = (csvWorkerSchemaErrors, JSONWorker) => {
  csvWorkerSchemaErrors.unshift({
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    errCode: TRANSFERSTAFFRECORD_ERROR() + 1,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    source: JSONWorker.transferStaffRecord,
    column: 'TRANSFERSTAFFRECORD',
    error: 'Cannot find an existing workplace with the reference provided in TRANSFERSTAFFRECORD',
  });
};

const _addErrorForSameLocalIdExistInNewWorkplace = (csvWorkerSchemaErrors, JSONWorker) => {
  csvWorkerSchemaErrors.unshift({
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    errCode: TRANSFERSTAFFRECORD_ERROR() + 2,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    source: JSONWorker.uniqueWorkerId,
    column: 'UNIQUEWORKERID',
    error: 'The UNIQUEWORKERID for this worker is already used in the new workplace given in TRANSFERSTAFFRECORD',
  });
};

const _crossValidateWorkersWithSameRefMovingToSameWorkplace = (
  csvWorkerSchemaErrors,
  allMovingWorkers,
  allNewWorkers,
) => {
  const workplacesDict = _buildWorkplaceDictWithNewWorkers(allNewWorkers);

  for (const JSONWorker of allMovingWorkers) {
    const newWorkplaceRef = JSONWorker.transferStaffRecord;
    const workerRef = JSONWorker.uniqueWorkerId.replace(/\s/g, '');

    if (!workplacesDict[newWorkplaceRef]) {
      workplacesDict[newWorkplaceRef] = new Set([workerRef]);
      continue;
    }

    if (!workplacesDict[newWorkplaceRef].has(workerRef)) {
      workplacesDict[newWorkplaceRef].add(workerRef);
      continue;
    }

    // if arrive at here, there is already another new or moving worker with that workerRef coming to the same new workplace
    _addErrorForWorkersWithSameRefsMovingToSameWorkplace(csvWorkerSchemaErrors, JSONWorker);
  }
};

const _buildWorkplaceDictWithNewWorkers = (allNewWorkers) => {
  return chain(allNewWorkers)
    .groupBy('localId') // workplace ref
    .mapValues((JSONWorkers) => JSONWorkers.map((JSONWorker) => JSONWorker.uniqueWorkerId.replace(/\s/g, '')))
    .mapValues((workerRefs) => new Set(workerRefs))
    .value();
};

const _addErrorForWorkersWithSameRefsMovingToSameWorkplace = (csvWorkerSchemaErrors, JSONWorker) => {
  csvWorkerSchemaErrors.unshift({
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    errCode: TRANSFERSTAFFRECORD_ERROR() + 3,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    source: JSONWorker.uniqueWorkerId,
    column: 'UNIQUEWORKERID',
    error:
      'There are more than one worker with this UNIQUEWORKERID moving into the new workplace given in TRANSFERSTAFFRECORD.',
  });
};

module.exports = {
  crossValidate,
  _crossValidateMainJobRole,
  crossValidateTransferStaffRecord,
  _isCQCRegulated,
};

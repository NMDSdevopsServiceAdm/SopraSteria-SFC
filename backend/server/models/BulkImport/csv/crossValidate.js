const { chain } = require('lodash');
const models = require('../../../models');
const { addCrossValidateError, MAIN_JOB_ERRORS, TRANSFER_STAFF_RECORD_ERRORS } = require('./crossValidateErrors');

const crossValidate = async (csvWorkerSchemaErrors, myEstablishments, JSONWorker) => {
  if (workerNotChanged(JSONWorker)) {
    return false;
  }

  const isCqcRegulated = await _isCQCRegulated(myEstablishments, JSONWorker);

  _crossValidateMainJobRole(csvWorkerSchemaErrors, isCqcRegulated, JSONWorker);
};

const _crossValidateMainJobRole = (csvWorkerSchemaErrors, isCqcRegulated, JSONWorker) => {
  if (!isCqcRegulated && JSONWorker.mainJobRoleId === 4) {
    addCrossValidateError(
      csvWorkerSchemaErrors,
      MAIN_JOB_ERRORS.RegisteredManagerWithoutCqcRegulatedService,
      JSONWorker,
    );
  }
};

const _isCQCRegulated = async (myEstablishments, JSONWorker) => {
  let workerEstablishmentKey;
  if (isMovingToNewWorkplace(JSONWorker)) {
    workerEstablishmentKey = JSONWorker.transferStaffRecord.replace(/\s/g, '');
  } else {
    workerEstablishmentKey = JSONWorker.establishmentKey;
  }

  const workerEstablishment = myEstablishments.find((establishment) => workerEstablishmentKey === establishment.key);

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
  const allNewWorkers = myJSONWorkers.filter((worker) => worker.status === 'NEW');
  const allOtherWorkers = myJSONWorkers.filter((worker) => !isMovingToNewWorkplace(worker) && worker.status !== 'NEW');

  const newWorkerWithDuplicateIdErrorAdded = _crossValidateWorkersWithSameRefMovingToSameWorkplace(
    csvWorkerSchemaErrors,
    allMovingWorkers,
    allNewWorkers,
    TRANSFER_STAFF_RECORD_ERRORS.SameRefsMovingToWorkplace,
  );

  if (newWorkerWithDuplicateIdErrorAdded) return;

  const existingWorkerWithDuplicateIdErrorAdded = _crossValidateWorkersWithSameRefMovingToSameWorkplace(
    csvWorkerSchemaErrors,
    allMovingWorkers,
    allOtherWorkers,
    TRANSFER_STAFF_RECORD_ERRORS.SameLocalIdExistInNewWorkplace,
  );

  if (existingWorkerWithDuplicateIdErrorAdded) return;

  for (const JSONWorker of allMovingWorkers) {
    const newWorkplaceId = await _validateTransferIsPossible(
      csvWorkerSchemaErrors,
      relatedEstablishmentIds,
      JSONWorker,
      allOtherWorkers,
    );

    if (newWorkplaceId) {
      _addNewWorkplaceIdToWorkerEntity(myAPIEstablishments, JSONWorker, newWorkplaceId);
    }
  }
};

const isMovingToNewWorkplace = (JSONWorker) => {
  return JSONWorker.status === 'UPDATE' && JSONWorker.transferStaffRecord;
};

const _validateTransferIsPossible = async (
  csvWorkerSchemaErrors,
  relatedEstablishmentIds,
  JSONWorker,
  allOtherWorkers,
) => {
  const newWorkplaceLocalRef = JSONWorker.transferStaffRecord;
  const newWorkplaceId = await _getNewWorkplaceId(newWorkplaceLocalRef, relatedEstablishmentIds);

  if (newWorkplaceId === null) {
    addCrossValidateError(csvWorkerSchemaErrors, TRANSFER_STAFF_RECORD_ERRORS.NewWorkplaceNotFound, JSONWorker);
    return;
  }

  const sameLocalIdExistsInNewWorkplace = await models.worker.findOneWithConflictingLocalRef(
    newWorkplaceId,
    JSONWorker.uniqueWorkerId,
  );

  if (sameLocalIdExistsInNewWorkplace) {
    const workerWithSameLocalIdInFile = allOtherWorkers.find(
      (worker) => worker.uniqueWorkerId == JSONWorker.uniqueWorkerId,
    );

    if (!workerWithSameLocalIdInFile?.changeUniqueWorker) {
      addCrossValidateError(
        csvWorkerSchemaErrors,
        TRANSFER_STAFF_RECORD_ERRORS.SameLocalIdExistInNewWorkplace,
        JSONWorker,
      );
    }
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

const _crossValidateWorkersWithSameRefMovingToSameWorkplace = (
  csvWorkerSchemaErrors,
  allMovingWorkers,
  otherWorkers,
  errorType,
) => {
  const workplacesDict = _buildWorkplaceDictWithNewWorkers(otherWorkers);

  let errorAdded = false;

  for (const JSONWorker of allMovingWorkers) {
    const newWorkplaceRef = JSONWorker.transferStaffRecord;

    const workerRef = JSONWorker.changeUniqueWorker
      ? JSONWorker.changeUniqueWorker.replace(/\s/g, '')
      : JSONWorker.uniqueWorkerId.replace(/\s/g, '');

    if (!workplacesDict[newWorkplaceRef]) {
      workplacesDict[newWorkplaceRef] = new Set([workerRef]);
      continue;
    }

    if (!workplacesDict[newWorkplaceRef].has(workerRef)) {
      workplacesDict[newWorkplaceRef].add(workerRef);
      continue;
    }
    // worker's ID exists in workplace in file
    addCrossValidateError(csvWorkerSchemaErrors, errorType, JSONWorker);

    errorAdded = true;
  }

  return errorAdded;
};

const _buildWorkplaceDictWithNewWorkers = (allNewWorkers) => {
  return chain(allNewWorkers)
    .groupBy('localId') // workplace ref
    .mapValues((JSONWorkers) =>
      JSONWorkers.map((JSONWorker) => {
        if (JSONWorker.changeUniqueWorker) return JSONWorker.changeUniqueWorker.replace(/\s/g, '');
        return JSONWorker.uniqueWorkerId.replace(/\s/g, '');
      }),
    )
    .mapValues((workerRefs) => new Set(workerRefs))
    .value();
};

module.exports = {
  crossValidate,
  _crossValidateMainJobRole,
  crossValidateTransferStaffRecord,
  _isCQCRegulated,
};

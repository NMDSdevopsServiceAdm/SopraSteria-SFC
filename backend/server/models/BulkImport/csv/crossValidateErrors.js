const MAIN_JOB_ROLE_ERROR_CODE = 1280;
const TRANSFER_STAFF_RECORD_BASE_ERROR_CODE = 1400;
const WORKER_DHA_WARNING_CODE = 5660;

const MAIN_JOB_ERRORS = {
  RegisteredManagerWithoutCqcRegulatedService: Object.freeze({
    errCode: MAIN_JOB_ROLE_ERROR_CODE,
    errType: 'MAIN_JOB_ROLE_ERROR',
    column: 'MAINJOBROLE',
    _sourceFieldName: 'mainJobRoleId',
    error:
      'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role',
  }),
};

const TRANSFER_STAFF_RECORD_ERRORS = {
  NewWorkplaceNotFound: Object.freeze({
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 1,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'TRANSFERSTAFFRECORD',
    _sourceFieldName: 'transferStaffRecord',
    error: 'The LOCALESTID in TRANSFERSTAFFRECORD does not exist',
  }),
  SameLocalIdExistInNewWorkplace: Object.freeze({
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 2,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'UNIQUEWORKERID',
    _sourceFieldName: 'uniqueWorkerId',
    error:
      "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID",
  }),
  SameRefsMovingToWorkplace: Object.freeze({
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 3,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'UNIQUEWORKERID',
    _sourceFieldName: 'uniqueWorkerId',
    error: 'Duplicate UNIQUEWORKERID’s are being moved to the same LOCALESTID in TRANSFERSTAFFRECORD',
  }),
};

const WORKER_DHA_WARNINGS = {
  MainJobCannotDoDHA: Object.freeze({
    warnCode: WORKER_DHA_WARNING_CODE + 1,
    warnType: 'DHA_WARNING',
    column: 'DHA',
    _sourceFieldName: 'carryOutDelegatedHealthcareActivities',
    warning:
      "Value entered for DHA will be ignored as worker's MAINJOBROLE cannot carry out delegated healthcare activities",
  }),
  WorkplaceMainServiceCannotDoDHA: Object.freeze({
    warnCode: WORKER_DHA_WARNING_CODE + 2,
    warnType: 'DHA_WARNING',
    column: 'DHA',
    _sourceFieldName: 'carryOutDelegatedHealthcareActivities',
    warning:
      "Value entered for DHA will be ignored as MAINSERVICE of worker's workplace cannot do delegated healthcare activities",
  }),

  WorkplaceAnsweredNoForStaffDoDHA: Object.freeze({
    warnCode: WORKER_DHA_WARNING_CODE + 3,
    warnType: 'DHA_WARNING',
    column: 'DHA',
    _sourceFieldName: 'carryOutDelegatedHealthcareActivities',
    warning: "Value entered for DHA will be ignored as worker's workplace has answered No for DHA",
  }),
};

const addCrossValidateError = (errorsArray, errorType, JSONWorker) => {
  const newErrorObject = {
    ...errorType,
    worker: JSONWorker.uniqueWorkerId,
    name: JSONWorker.localId,
    lineNumber: JSONWorker.lineNumber,
    source: JSONWorker[errorType._sourceFieldName],
  };
  delete newErrorObject._sourceFieldName;

  errorsArray.unshift(newErrorObject);
};

module.exports = {
  addCrossValidateError,
  MAIN_JOB_ERRORS,
  TRANSFER_STAFF_RECORD_ERRORS,
  WORKER_DHA_WARNINGS,
};

const MAIN_JOB_ROLE_ERROR_CODE = 1280;
const TRANSFER_STAFF_RECORD_BASE_ERROR_CODE = 1400;

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
      "The UNIQUEWORKERID already exists in the LOCALESTID given in TRANSFERSTAFFRECORD. Use CHGUNIQUEWRKID to change this worker's UNIQUEWORKERID.",
  }),
  SameRefsMovingToWorkplace: Object.freeze({
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 3,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'UNIQUEWORKERID',
    _sourceFieldName: 'uniqueWorkerId',
    error: 'Duplicate UNIQUEWORKERID’s are being moved to the same LOCALESTID in TRANSFERSTAFFRECORD',
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
};

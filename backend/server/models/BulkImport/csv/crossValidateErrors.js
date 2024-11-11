const MAIN_JOB_ROLE_ERROR_CODE = 1280;
const TRANSFER_STAFF_RECORD_BASE_ERROR_CODE = 1400;

const MAIN_JOB_ERRORS = Object.freeze({
  RegisteredManagerWithoutCqcRegulatedService: {
    errCode: MAIN_JOB_ROLE_ERROR_CODE,
    errType: 'MAIN_JOB_ROLE_ERROR',
    column: 'MAINJOBROLE',
    _sourceFieldName: 'mainJobRoleId',
    error:
      'Workers MAINJOBROLE is Registered Manager but you are not providing a CQC regulated service. Please change to another Job Role',
  },
});

const TRANSFER_STAFF_RECORD_ERRORS = Object.freeze({
  NewWorkplaceNotFound: {
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 1,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'TRANSFERSTAFFRECORD',
    _sourceFieldName: 'transferStaffRecord',
    error: 'Cannot find an existing workplace with the reference provided in TRANSFERSTAFFRECORD',
  },
  SameLocalIdExistInNewWorkplace: {
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 2,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'UNIQUEWORKERID',
    _sourceFieldName: 'uniqueWorkerId',
    error: 'The UNIQUEWORKERID for this worker is already used in the new workplace given in TRANSFERSTAFFRECORD',
  },
  SameRefsMovingToWorkplace: {
    errCode: TRANSFER_STAFF_RECORD_BASE_ERROR_CODE + 3,
    errType: 'TRANSFERSTAFFRECORD_ERROR',
    column: 'UNIQUEWORKERID',
    _sourceFieldName: 'uniqueWorkerId',
    error:
      'There are more than one worker with this UNIQUEWORKERID moving into the new workplace given in TRANSFERSTAFFRECORD.',
  },
});

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

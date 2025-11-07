const { trainingHeaders } = require('./data/trainingHeaders');

const WorkplaceCSVValidator = require('../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;

const isWorkerFile = (fileAsString) => {
  const headersRegexBaseCase = /LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,/;
  const headersRegexChangeUniqueWorkerId = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DISPLAYID,/;
  const headersRegexTransferStaffRecord = /LOCALESTID,UNIQUEWORKERID,TRANSFERSTAFFRECORD,STATUS,DISPLAYID,/;
  const headersRegexChangeUniqueWorkerIdTransferStaffRecord =
    /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,TRANSFERSTAFFRECORD,STATUS,DISPLAYID,/;

  const regexToCheckHeaders = [
    headersRegexBaseCase,
    headersRegexChangeUniqueWorkerId,
    headersRegexTransferStaffRecord,
    headersRegexChangeUniqueWorkerIdTransferStaffRecord,
  ];

  const headerRow = fileAsString.split('\n')[0];

  return regexToCheckHeaders.some((regex) => regex.test(headerRow));
};

const isTrainingFile = (fileAsString) => {
  const headerRow = fileAsString.split('\n')[0];
  console.log(headerRow, '<--- headerRow');
  const contentRegex = new RegExp(trainingHeaders);
  console.log(trainingHeaders, '<--- trainingHeaders');
  return contentRegex.test(headerRow);
};

const getFileType = (fileData) => {
  if (WorkplaceCSVValidator.isContent(fileData)) {
    return 'Establishment';
  } else if (isWorkerFile(fileData)) {
    return 'Worker';
  } else if (isTrainingFile(fileData)) {
    return 'Training';
  }
  return null;
};

module.exports = {
  isWorkerFile,
  isTrainingFile,
  getFileType,
};

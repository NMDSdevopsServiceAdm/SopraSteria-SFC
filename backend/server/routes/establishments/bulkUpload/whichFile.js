const WorkplaceCSVValidator = require('../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;

const isWorkerFile = (fileAsString) => {
  const headersRegexBaseCase = /LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,/;
  const headersRegexChangeUniqueWorkerId = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DISPLAYID,/;
  const headersRegexTransferStaffRecord = /LOCALESTID,UNIQUEWORKERID,TRANSFERSTAFFRECORD,STATUS,DISPLAYID,/;
  const regexToCheckHeaders = [headersRegexBaseCase, headersRegexChangeUniqueWorkerId, headersRegexTransferStaffRecord];

  const headerRow = fileAsString.split('\n')[0];

  return regexToCheckHeaders.some((regex) => regex.test(headerRow));
};

const isTrainingFile = (fileAsString) => {
  const contentRegex = /LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT/;
  return contentRegex.test(fileAsString.substring(0, 50));
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

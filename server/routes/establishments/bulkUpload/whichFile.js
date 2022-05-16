const workplaceCSVValidator = require('../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;

const isWorkerFile = (fileAsString) => {
  const contentRegex1 = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI/;
  const contentRegex2 = /LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,/;

  return contentRegex1.test(fileAsString.substring(0, 50)) || contentRegex2.test(fileAsString.substring(0, 50));
};

const isTrainingFile = (fileAsString) => {
  const contentRegex = /LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DAT/;
  return contentRegex.test(fileAsString.substring(0, 50));
};

const getFileType = (fileData) => {
  if (workplaceCSVValidator.isContent(fileData)) {
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

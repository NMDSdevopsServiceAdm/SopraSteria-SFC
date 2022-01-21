const AWS = require('aws-sdk');
const { mappings } = require('../../../models/BulkImport/BUDI');
const config = require('../../../config/config');

const invokeLambda = async (functionName, payload) => {
  const FunctionName = `bulkupload-${config.get('bulkupload.lambda.stage')}-${functionName}`;
  const Payload = JSON.stringify(payload);
  const lambda = new AWS.Lambda({ region: 'eu-west-2' });
  const params = {
    FunctionName,
    Payload,
  };

  const response = await lambda.invoke(params).promise();
  return JSON.parse(response.Payload);
};

const validateWorkerLambda = async (thisLine, currentLineNumber, existingWorker) => {
  const payload = {
    thisLine,
    currentLineNumber,
    existingWorker,
    mappings,
  };
  return await invokeLambda('validateWorker', payload);
};

module.exports = {
  validateWorkerLambda,
};

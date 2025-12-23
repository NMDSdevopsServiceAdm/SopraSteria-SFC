const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const { fromContainerMetadata } = require('@aws-sdk/credential-providers');
const { mappings, mappingBuilder } = require('../../../../reference/BUDIMappings');
const config = require('../../../config/config');
const region = String(config.get('bulkupload.lambdaRegion'));
const env = String(config.get('env'));

const getLambdaClient = () => {
  if (env === 'localhost') {
    return new LambdaClient({
      region,
    });
  }

  return new LambdaClient({
    credentials: fromContainerMetadata({
      timeout: 1000,
      maxRetries: 0,
    }),
    region,
  });
};

const lambdaClient = getLambdaClient();

const invokeLambda = async (functionName, payload) => {
  const FunctionName = `bulkupload-${config.get('bulkupload.lambda.stage')}-${functionName}`;
  const Payload = JSON.stringify(payload);

  const params = {
    FunctionName,
    Payload,
  };

  const rawResponse = await lambdaClient.send(new InvokeCommand(params));
  const response = Buffer.from(rawResponse.Payload).toString();

  return JSON.parse(response);
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

const validateTrainingLambda = async (thisLine, currentLineNumber) => {
  const mappingsFromBuilder = await mappingBuilder();
  const trainingMappings = { ...mappings, ...mappingsFromBuilder };

  const payload = {
    thisLine,
    currentLineNumber,
    mappings: trainingMappings,
  };
  return await invokeLambda('validateTraining', payload);
};

module.exports = {
  validateWorkerLambda,
  validateTrainingLambda,
};

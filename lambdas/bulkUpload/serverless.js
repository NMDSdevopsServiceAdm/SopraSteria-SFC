'use strict';
// serverless.js

module.exports = {
  service: 'bulkupload',
  frameworkVersion: '3',

  provider: {
    name: 'aws',
    runtime: 'nodejs22.x',
    lambdaHashingVersion: '20201221',
    stage: process.env.STAGE ?? 'dev',
    region: process.env.BULK_UPLOAD_LAMBDA_REGION ?? 'eu-west-2',
    ...(process.env.LAMBDA_ROLE_ARN && { iam: { role: process.env.LAMBDA_ROLE_ARN } }),
  },

  functions: {
    validateWorker: {
      handler: 'handler.validateWorker',
    },
    validateTraining: {
      handler: 'handler.validateTraining',
    },
  },
};

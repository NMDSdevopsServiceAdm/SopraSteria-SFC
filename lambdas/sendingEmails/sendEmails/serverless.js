'use strict';
// serverless.js

module.exports = {
  service: 'sendEmails',
  frameworkVersion: '3',

  provider: {
    name: 'aws',
    runtime: 'nodejs22.x',
    lambdaHashingVersion: '20201221',
    stage: process.env.STAGE ?? 'dev',
    region: process.env.SEND_EMAILS_LAMBDA_REGION ?? 'eu-west-2',
    ...(process.env.SEND_EMAILS_LAMBDA_ROLE_ARN && { iam: { role: process.env.SEND_EMAILS_LAMBDA_ROLE_ARN } }),
  },

  functions: {
    sendEmails: {
      handler: 'app.lambdaHandler',
      name: `${process.env.STAGE}-send-emails`,
    },
  },
};

// initialises AWS SDK

// note - credentials are taken from environment variables
const AWS_KEY = process.env.AWS_ACCESS_KEY_ID || null;
const AWS_SECRET = process.env.AWS_SECRET_ACCESS_KEY || null;

const AWS = require('aws-sdk');
const config = require('../../config/config');

let theAWS = null;
if (AWS_KEY && AWS_SECRET && config.get('aws.enabled')) {
  AWS.config.update({
    region: config.get('aws.region')
  });
  theAWS = AWS;
}

exports.AWS = theAWS;
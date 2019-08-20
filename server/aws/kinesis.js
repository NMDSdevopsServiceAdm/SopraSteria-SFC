const AWS = require('aws-sdk');
const moment = require('moment');
const config = require('../config/config');

let kinesis = null;

const initialise = (region) => {
  kinesis = new AWS.Kinesis({
    apiVersion: '2013-12-02',
    region
  });
};

const ACTIONS = ['created', 'updated', 'deleted'];

const establishmentPump = async (action, establishment)  => {
  if (!kinesis) return;
  if (!ACTIONS.includes(action)) return;
  if (!config.get('aws.kinesis.enabled')) return;

  const pumpData = {
    action,
    establishment,
  };

  const params = {
    Data: JSON.stringify(pumpData),
    PartitionKey: establishment.uid,    // establishment's primary key
    StreamName: config.get('aws.kinesis.establishments'),
    // ExplicitHashKey: 'STRING_VALUE',
    // SequenceNumberForOrdering: 'STRING_VALUE'
  };

  try {
    const status = await kinesis.putRecord(params).promise();
    // console.log("establishmentPump status: ", status)

  } catch (err) {
    // trap any errors - stop them from propagating - an error on kinesis stop not interfere with the application
    console.error('establishmentPump error: ', err);
  }
}

const workerPump = async (action, worker)  => {
  if (!kinesis) return;
  if (!ACTIONS.includes(action)) return;
  if (!config.get('aws.kinesis.enabled')) return;

  const pumpData = {
    action,
    worker,
  };

  // remove sensitive/unnecessary data
  worker.age = years = moment().diff(worker.dateOfBirth, 'years');
  //delete worker.id;    // there is no id on worker
  delete worker.nationalInsuranceNumber;
  delete worker.dateOfBirth;
  delete worker.postcode;

  const params = {
    Data: JSON.stringify(pumpData),
    PartitionKey: worker.uid,    // establishment's primary key
    StreamName: config.get('aws.kinesis.workers'),
  };

  try {
    const status = await kinesis.putRecord(params).promise();
    // console.log("workerPump status: ", status)

  } catch (err) {
    // trap any errors - stop them from propagating - an error on kinesis stop not interfere with the application
    console.error('workerPump error: ', err);
  }
}

const userPump = async (action, user)  => {
  if (!kinesis) return;
  if (!ACTIONS.includes(action)) return;
  if (!config.get('aws.kinesis.enabled')) return;

  const pumpData = {
    action,
    user,
  }

  // remove sensitive/unnecessary data
  //delete worker.id;    // there is no id on user
  // security question and answer is required by SFC Admins to identify the inbound callers
  const params = {
    Data: JSON.stringify(pumpData),
    PartitionKey: user.uid,    // establishment's primary key
    StreamName: config.get('aws.kinesis.users'),
  };

  try {
    const status = await kinesis.putRecord(params).promise();
    // console.log("userPump status: ", status)

  } catch (err) {
    // trap any errors - stop them from propagating - an error on kinesis stop not interfere with the application
    console.error('userPump error: ', err);
  }
}

module.exports.initialise = initialise;
module.exports.establishmentPump = establishmentPump;
module.exports.workerPump = workerPump;
module.exports.userPump = userPump;
module.exports.CREATED = 'created';
module.exports.UPDATED = 'updated';
module.exports.DELETED = 'deleted';

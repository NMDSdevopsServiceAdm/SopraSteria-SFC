// handles posting of data to AWS Kinesis streams
const config = require('../../../config/config');
const AWS = require('../init').AWS;

const PUMP_ACTION_CREATE = 1;
const PUMP_ACTION_UPDATE = 2;
const PUMP_ACTION_DELETE = 3;

exports.PUMP_ACTION_CREATE = PUMP_ACTION_CREATE;
exports.PUMP_ACTION_UPDATE = PUMP_ACTION_UPDATE;
exports.PUMP_ACTION_DELETE = PUMP_ACTION_DELETE;

const KINESIS = AWS && config.get('aws.kinesis.enabled') ? new AWS.Kinesis() : null;

const actionToString = (action) => {
  let actionname = null;
  switch (action) {
    case PUMP_ACTION_DELETE:
      actionname = "Deleted";
      break;
    case PUMP_ACTION_UPDATE:
      actionname = "Updated";
      break;
    case PUMP_ACTION_CREATE:
      actionname = "Created";
      break;
  }
  return actionname;
};

exports.establishmentPump = async (action, establishment) => {
  if (KINESIS) {
    console.log(`WA DEBUG - pumping establishment to AWS Kinesis (${actionToString(action)}): `, establishment.establishment.uid);
  } else {
    console.log('WA DEBUG - Kinesis is not enabled');
  }
};

exports.workerPump = async (action, worker) => {
  if (KINESIS) {
    console.log(`WA DEBUG - pumping worker to AWS Kinesis (${actionToString(action)}): `, worker.worker.uid);
  } else {
    console.log('WA DEBUG - Kinesis is not enabled');
  }
};

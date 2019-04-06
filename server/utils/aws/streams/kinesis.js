// handles posting of data to AWS Kinesis streams
const config = require('../../../config/config');
const AWS = require('../init').AWS;

const PUMP_ACTION_CREATE = 1;
const PUMP_ACTION_UPDATE = 2;
const PUMP_ACTION_DELETE = 3;

exports.PUMP_ACTION_CREATE = PUMP_ACTION_CREATE;
exports.PUMP_ACTION_UPDATE = PUMP_ACTION_UPDATE;
exports.PUMP_ACTION_DELETE = PUMP_ACTION_DELETE;

const KINESIS = AWS && config.get('aws.kinesis.enabled') ? new AWS.Kinesis({region: config.get('aws.region')}) : null;

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
    const params = {
      Records: [],
      StreamName: config.get('aws.kinesis.establishments')
    };

    // use the Establishment's own unique key (UID) as the partioning key
    // TODO: use Establishment UID (once it's known by Workers)
    params.Records.push({
      Data: JSON.stringify(establishment),
      PartitionKey: establishment.id.toString()
    });

    try {
      await KINESIS.putRecords(params).promise();
    } catch (err) {
      console.error('establishmentPump failed: ', err);
    }

  } else {
    console.log('WA DEBUG - Kinesis is not enabled');
  }
};

exports.workerPump = async (action, worker) => {
  if (KINESIS) {
    const params = {
      Records: [],
      StreamName: config.get('aws.kinesis.workers')
    };

    // use the Workers's establishment id as the partioning key, that way, all records associated
    //  with the same Establishment enter the same shard
    params.Records.push({
      Data: JSON.stringify(worker),
      PartitionKey: worker.establishmentId.toString()
    });

    try {
      await KINESIS.putRecords(params).promise();
    } catch (err) {
      console.error('workerPump failed: ', err);
    }

  } else {
    console.log('WA DEBUG - Kinesis is not enabled');
  }
};

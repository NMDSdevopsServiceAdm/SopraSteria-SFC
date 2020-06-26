

// Prevent multiple training report requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const acquireLock = async function(logic, newState, req, res) {
  const { establishmentId } = req;

  req.startTime = new Date().toISOString();

  console.log(`Acquiring lock for establishment ${establishmentId}.`);

  // attempt to acquire the lock
  const currentLockState = await attemptToAcquireLock(establishmentId);

  // if no records were updated the lock could not be acquired
  // Just respond with a 409 http code and don't call the regular logic
  // close the response either way and continue processing in the background
  if (currentLockState[1] === 0) {
    console.log('Lock *NOT* acquired.');
    res.status(409).send({
      message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`,
    });

    return;
  }

  console.log('Lock acquired.', newState);

  let nextState;

  switch (newState) {
    case buStates.DOWNLOADING:
    {
      // get the current training report state
      const currentState = await lockStatus(establishmentId);

      if (currentState.length === 1) {
        // don't update the status for downloads, just hold the lock
        newState = currentState[0].TrainingReportState;
        nextState = null;
      } else {
        nextState = buStates.READY;
      }
    }
      break;

    case buStates.COMPLETING:
      nextState = buStates.READY;
      break;

    default:
      newState = buStates.READY;
      nextState = buStates.READY;
      break;
  }

  // update the current state
  await updateLockState(establishmentId, newState);

  req.buRequestId = String(uuid()).toLowerCase();

  res.status(200).send({
    message: `Lock for establishment ${establishmentId} acquired.`,
    requestId: req.buRequestId,
  });

  // run whatever the original logic was
  try {
    await logic(req, res);
  } catch (e) {}

  // release the lock
  await releaseLock(req, null, null, nextState);
};

const releaseLock = async (req, res, next, nextState = null) => {
  const establishmentId = req.query.subEstId || req.establishmentId;

  if (Number.isInteger(establishmentId)) {
    await releaseLockQuery(establishmentId, nextState);

    console.log(`Lock released for establishment ${establishmentId}`);
  }

  if (res !== null) {
    res.status(200).send({
      establishmentId,
    });
  }
};

const signedUrlGet = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    await saveResponse(req, res, 200, {
      urls: s3.getSignedUrl('putObject', {
        Bucket,
        Key: `${establishmentId}/latest/${moment(date).format('YYYY-MM-DD')}-SFC-Training-Report.xlsx`,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Metadata: {
          username: String(req.username),
          establishmentId: String(establishmentId),
        },
        Expires: config.get('bulkupload.uploadSignedUrlExpire'),
      }),
    });
  } catch (err) {
    console.error('report/training:PreSigned - failed', err.message);
    await saveResponse(req, res, 503, {});
  }
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3
    .putObject({
      Bucket,
      Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined,
      }),
    })
    .promise();
};

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid',
    });

    return;
  }

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`,
  })
    .promise()
    .then(data => {
      const jsonData = JSON.parse(data.Body.toString());

      if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
        if (jsonData.responseHeaders) {
          res.set(jsonData.responseHeaders);
        }

        if (jsonData.responseBody && jsonData.responseBody.type && jsonData.responseBody.type === 'Buffer') {
          res.status(jsonData.responseCode).send(Buffer.from(jsonData.responseBody));
        } else {
          res.status(jsonData.responseCode).send(jsonData.responseBody);
        }
      } else {
        console.log('TrainingReport::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch(err => {
      console.log('TrainingReport::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found',
      });
    });
};

const lockStatusGet = async (req, res) => {
  const { establishmentId } = req;

  const currentLockState = await lockStatus(establishmentId);

  res
    .status(200) // don't allow this to be able to test if an establishment exists so always return a 200 response
    .send(
      currentLockState.length === 0
        ? {
          establishmentId,
          TrainingReportState: buStates.READY,
          TrainingReportdLockHeld: true,
        }
        : currentLockState[0]
    );

  return currentLockState[0];
};

const reportGet = async (req, res) => {
  try {
    // first ensure this report can only be run by those establishments that are a parent
    const thisEstablishment = await models.establishment.findOne({
      where: {
        id: req.establishmentId
      },
      attributes: ['id']
    });

    if(thisEstablishment){
      const date = new Date();
      const report = await getReport(date, thisEstablishment.id);

      if (report) {
        await saveResponse(req, res, 200, report, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-disposition': `attachment; filename=${moment(date).format('YYYY-MM-DD')}-SFC-Training-Report.xlsx`,
        });
        console.log('report/training - 200 response');
      } else {
        // only allow on those establishments being a parent

        console.log('report/training 403 response');
        await saveResponse(req, res, 403, {});
      }
    }else{
      console.error('report/training - failed restoring establisment');
      await saveResponse(req, res, 503, {});
    }
  } catch (err) {
    console.error('report/training - failed', err);
    await saveResponse(req, res, 503, {});
  }
};

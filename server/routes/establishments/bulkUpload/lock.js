'use strict';
const uuid = require('uuid');
const { attemptToAcquireLock, updateLockState, lockStatus, releaseLockQuery } = require('../../../data/bulkUploadLock');
const { buStates } = require('./states');

// Prevent multiple bulk upload requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const acquireLock = async function (logic, newState, complete, req, res) {
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
        // get the current bulk upload state
        const currentState = await lockStatus(establishmentId);

        if (currentState.length === 1) {
          // don't update the status for downloads, just hold the lock
          newState = currentState[0].bulkUploadState;
          nextState = null;
        } else {
          nextState = buStates.READY;
        }
      }
      break;

    case buStates.UPLOADING:
      nextState = buStates.UPLOADED;
      break;

    case buStates.VALIDATING:
      // we don't yet know wether the validation should go to the PASSED, FAILED
      // or WARNINGS state next as it depends on whether the data is valid or not
      nextState = null;
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
  } catch (e) {
    console.error(e);
  }

  if (complete) {
    await completeLock(req, res, newState, nextState);
  }
};

const completeLock = async (req, res, newState, nextState) => {
  if (newState === buStates.VALIDATING) {
    switch (res.buValidationResult) {
      case buStates.PASSED:
      case buStates.WARNINGS:
        nextState = res.buValidationResult;
        break;

      default:
        nextState = buStates.FAILED;
        break;
    }
  }

  // release the lock
  await releaseLock(req, null, null, nextState);
};

const releaseLock = async (req, res, next, nextState = null) => {
  try {
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
  } catch (error) {
    console.error(error.name);
    console.error(error.message);
  }
};

const lockStatusGet = async (req, res) => {
  const { establishmentId } = req;
  res.setTimeout(1000, () => {
    res.status(200).send({
      establishmentId,
      bulkUploadState: buStates.UNKNOWN,
      bulkUploadLockHeld: true,
    });
  });

  const currentLockState = await lockStatus(establishmentId);

  res
    .status(200) // don't allow this to be able to test if an establishment exists so always return a 200 response
    .send(
      currentLockState.length === 0
        ? {
            establishmentId,
            bulkUploadState: buStates.READY,
            bulkUploadLockHeld: true,
          }
        : currentLockState[0],
    );

  return currentLockState[0];
};

const router = require('express').Router();

router.route('/lockstatus').get(lockStatusGet);
router.route('/unlock').get(releaseLock);

module.exports = router;

module.exports.acquireLock = acquireLock;
module.exports.releaseLock = releaseLock;
module.exports.completeLock = completeLock;

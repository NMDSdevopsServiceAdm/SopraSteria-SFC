'use strict';
const { Worker } = require('worker_threads');

const { buStates } = require('../states');

const validate = async (req) => {
  const newReq = {
    establishmentId: req.establishmentId,
    username: req.username,
    isParent: req.isParent,
    buRequestId: req.buRequestId,
    url: req.url,
    startTime: req.startTime,
    query: {
      subEstId: req.query.subEstId,
    },
  };
  const newRes = {};
  new Worker(`${__dirname}/validatePut.js`, {
    workerData: {
      req: newReq,
      res: newRes,
    },
  });
};

const { acquireLock } = require('../lock');
const router = require('express').Router();

router.route('/').put(acquireLock.bind(null, validate, buStates.VALIDATING, false));

module.exports = router;

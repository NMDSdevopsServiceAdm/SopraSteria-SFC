const express = require('express');
const router = express.Router({mergeParams: true});

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

router.route('/').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const workers = req.body;

  if (!workers || !Array.isArray(workers))
  {
    res.status(400)
    return res.send('Unexpected Input.');
  }

  workers.forEach(worker => {
    if (!uuidRegex.test(worker.uid.toUpperCase())) {
      res.status(400)
      return res.send('Unexpected worker id');
    }
  });

  try {
    const workersToSave = [];

    for (let worker of workers) {
      const thisWorker = new Workers.Worker(establishmentId);
      const workerId = worker.uid;

      if (await thisWorker.restore(workerId)) {
        // by loading after the restore, only those properties defined in the
        //  PUT body will be updated (peristed)
        const isValidWorker = await thisWorker.load(worker);
        // this is an update to an existing Worker, so no mandatory properties!
        if (isValidWorker) {
            workersToSave.push(thisWorker);
        } else {
            res.status(400)
            return res.send('Unexpected Input.');
        }
      } else {
          // not found worker
          res.status(404)
          return res.send('Not Found');
      }
    }

    await Workers.Worker.saveMany(req.username, workersToSave);

    res.status(200)
    return res.send();

  } catch (err) {
    if (err instanceof Workers.WorkerExceptions.WorkerSaveException && err.message == 'Duplicate LocalIdentifier') {
      console.error("Worker::localidentifier PUT: ", err.message);
      res.status(400)
      return res.send(err.safe);
    } else if (err instanceof Workers.WorkerExceptions.WorkerJsonException) {
      console.error("Worker PUT: ", err.message);
      res.status(400)
      return res.send(err.safe);
    } else if (err instanceof Workers.WorkerExceptions.WorkerSaveException) {
      console.error("Worker PUT: ", err.message);
      res.status(503)
      return res.send(err.safe);
    }
  }
})

module.exports = router;

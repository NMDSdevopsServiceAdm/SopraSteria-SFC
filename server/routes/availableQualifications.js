const express = require('express');
const router = express.Router();
const models = require('../models/index');
const moment = require('moment');
const isAuthorisedInternalAdminApp = require('../utils/security/isAuthenticated').isAuthorisedInternalAdminApp;


// attach middleware authentication
router.use('/', isAuthorisedInternalAdminApp);

// update qualification by given id
router.route('/:id').put(async function (req, res) {
  const qualification = req.body;
  const qualificationId = parseInt(req.params.id, 10);

  if (!qualificationId || isNaN(qualificationId)) {
    return res.status(400).send('Missing qualification id param');
  }

  if (!qualification ||
      !qualification.seq ||
      !Number.isInteger(qualification.seq) ||
      !qualification.title ||
      !qualification.title.length === 0 ||
      !qualification.group ||
      !qualification.group.length === 0) {
    return res.status(400).send('Invalid input');
  }

  try {
    const updateDocument = {
      seq: qualification.seq,
      group: qualification.group,
      title: qualification.title,
      level: qualification.level,
      code: qualification.code,
      from: qualification.from && qualification.from.length > 0 ? moment.utc(qualification.from, "YYYY-MM-DD").toDate() : null,
      until: qualification.until && qualification.until.length > 0 ? moment.utc(qualification.until, "YYYY-MM-DD").toDate() : null,
      multipleLevels: qualification.multipleLevel,
      socialCareRelevant: qualification.socialCareRelevant,
      analysisFileCode: qualification.analysisFileCode,
    };

    let results = await models.workerAvailableQualifications.update(
      updateDocument,
      {
        where: {
          id: qualificationId
        }
      });

    res.status(200).send({qualification: { id: qualificationId }});

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

// add a new qualification
router.route('/').post(async function (req, res) {
  const qualification = req.body;

  if (!qualification ||
       !qualification.id ||
       !Number.isInteger(qualification.id) ||
       !qualification.seq ||
       !Number.isInteger(qualification.seq) ||
       !qualification.title ||
       !qualification.title.length === 0 ||
       !qualification.group ||
       !qualification.group.length === 0) {
   return res.status(400).send({});
  }

  try {
    // first try to find a qualification with the given id
    let results = await models.workerAvailableQualifications.findOne({
      where: {
        id: qualification.id
      }
    });

    if (results && results.id) {
      // a qualification with this ID already exists
      return res.status(400).send({reason: "duplicate id"});
    }

    const createDocument = {
      id: qualification.id,
      seq: qualification.seq,
      group: qualification.group,
      title: qualification.title,
      level: qualification.level,
      code: qualification.code,
      from: qualification.from && qualification.from.length > 0 ? moment.utc(qualification.from, "YYYY-MM-DD").toDate() : null,
      until: qualification.until && qualification.until.length > 0 ? moment.utc(qualification.until, "YYYY-MM-DD").toDate() : null,
      multipleLevels: qualification.multipleLevel,
      socialCareRelevant: qualification.socialCareRelevant,
      analysisFileCode: qualification.analysisFileCode,
    };

    await models.workerAvailableQualifications.create(createDocument);
    res.status(200).send({qualification: { id: qualification.id}});

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});


module.exports = router;

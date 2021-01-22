const express = require('express');
const router = express.Router({mergeParams: true});

const JobFormatters = require('../../models/api/jobs');

const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');

const filteredProperties = ['Name', 'Vacancies', 'Starters', 'Leavers'];

// gets current job quotas for the known establishment
const getJobs = async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
      // show only brief info on Establishment
      const jsonResponse = thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false, false, filteredProperties);
      const resultJSON = {
        ...jsonResponse,
        ...JobFormatters.combineAllJobsJSON(jsonResponse),
      };

      // amalgamated vacancies, starters and leavers, therefore remove them from parent scope
      delete resultJSON.Vacancies;
      delete resultJSON.Starters;
      delete resultJSON.Leavers;
      delete resultJSON.TotalVacencies;
      delete resultJSON.TotalStarters;
      delete resultJSON.TotalLeavers;

      return res.status(200).json(resultJSON);
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }

  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

    console.error('establishment::jobs GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
};

// updates the current jobs  for the known establishment
const updateJobs = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);


  try {
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(establishmentId)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in vacancies
      const isValidEstablishment = await thisEstablishment.load({
        vacancies: req.body.vacancies,
        starters: req.body.starters,
        leavers: req.body.leavers,
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        const jsonResponse = thisEstablishment.toJSON(false, false, false, true, false, filteredProperties);
        const resultJSON = {
          ...jsonResponse,
          ...JobFormatters.combineAllJobsJSON(jsonResponse),
        };

        // amalgamated vacancies, starters and leavers, therefore remove them from parent scope
        delete resultJSON.jobs;
        // delete resultJSON.Vacancies;
        // delete resultJSON.Starters;
        // delete resultJSON.Leavers;
        // delete resultJSON.TotalVacencies;
        // delete resultJSON.TotalStarters;
        // delete resultJSON.TotalLeavers;

        // total starters, leavers and vacancies are always

        return res.status(200).json(resultJSON);
      } else {
        return res.status(400).send('Unexpected Input.');
      }

    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {

    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::staff POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::staff POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
};

router.route('/').get(hasPermission('canViewEstablishment'), getJobs);
router.route('/').post(hasPermission('canEditEstablishment'), updateJobs);

module.exports = router;

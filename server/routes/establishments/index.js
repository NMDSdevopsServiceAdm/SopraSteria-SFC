// default route and registration of all sub routes
const express = require('express');
const router = express.Router();
const slack = require('../../utils/slack/slack-logger');
const sns = require('../../aws/sns');
const Authorization = require('../../utils/security/isAuthenticated');
const { hasPermission } = require('../../utils/security/hasPermission');

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');
const models = require('../../models');

const Name = require('./name');
const MainService = require('./mainService');
const EmployerType = require('./employerType');
const Services = require('./services');
const ServiceUsers = require('./serviceUsers');
const Capacity = require('./capacity');
const ShareData = require('./shareData');
const Staff = require('./staff');
const Jobs = require('./jobs');
const LA = require('./la');
const Worker = require('./worker');
const BulkUpload = require('./bulkUpload');
const LocalIdentifier = require('./localIdentifier');
const LocalIdentifiers = require('./localIdentifiers');
const Permissions = require('./permissions');
const OwnershipChange = require('./ownershipChange');
const LinkToParent = require('./linkToParent');
const DataPermissions = require('./dataPermissions');
const LocationDetails = require('./locationdetails');
const MandatoryTraining = require('./mandatoryTraining');
const Workers = require('./workers');
const Benchmarks = require('./benchmarks');

const OTHER_MAX_LENGTH = 120;

const responseErrors = {
  unexpectedMainServiceId: {
    errCode: -300,
    errMessage: 'Unexpected main service',
  },
  invalidEstablishment: {
    errCode: -700,
    errMessage: 'Establishment data is invalid',
  },
};

// Errors for initialise and registration error - this needs to be refactored out DB
class RegistrationException {
  constructor(originalError, errCode, errMessage) {
    this.err = originalError;
    this.errCode = errCode;
    this.errMessage = errMessage;
  }

  toString() {
    return `${this.errCode}: ${this.errMessage}`;
  }
}

// ensure all establishment routes are authorised
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/name', Name);
router.use('/:id/mainService', MainService);
router.use('/:id/employerType', EmployerType);
router.use('/:id/services', Services);
router.use('/:id/serviceUsers', ServiceUsers);
router.use('/:id/capacity', Capacity);
router.use('/:id/share', ShareData);
router.use('/:id/staff', Staff);
router.use('/:id/jobs', Jobs);
router.use('/:id/localAuthorities', LA);
router.use('/:id/worker', Worker);
router.use('/:id/bulkupload', BulkUpload);
router.use('/:id/localIdentifier', LocalIdentifier);
router.use('/:id/localIdentifiers', LocalIdentifiers);
router.use('/:id/permissions', Permissions);
router.use('/:id/ownershipChange', OwnershipChange);
router.use('/:id/linkToParent', LinkToParent);
router.use('/:id/dataPermissions', DataPermissions);
router.use('/:id/locationDetails', LocationDetails);
router.use('/:id/mandatoryTraining', MandatoryTraining);
router.use('/:id/workers', Workers);
router.use('/:id/benchmarks', Benchmarks);

const addEstablishment = async (req, res) => {
  if (!req.body.isRegulated) {
    delete req.body.locationId;
  }

  const establishmentData = {
    Name: req.body.locationName,
    Address1: req.body.addressLine1,
    Address2: req.body.addressLine2,
    Address3: req.body.addressLine3,
    Town: req.body.townCity,
    County: req.body.county,
    LocationID: req.body.locationId,
    PostCode: req.body.postalCode,
    MainService: req.body.mainService,
    MainServiceId: null,
    MainServiceOther: req.body.mainServiceOther,
    IsRegulated: req.body.isRegulated,
  };

  try {
    await models.sequelize.transaction(async (t) => {
      // Get the main service depending on whether the establishment is or is not cqc registered
      let serviceResults = null;
      if (establishmentData.IsRegulated) {
        serviceResults = await models.services.findOne({
          where: {
            name: establishmentData.MainService,
            isMain: true,
          },
        });
      } else {
        serviceResults = await models.services.findOne({
          where: {
            name: establishmentData.MainService,
            iscqcregistered: false,
            isMain: true,
          },
        });
      }

      if (serviceResults && serviceResults.id && establishmentData.MainService === serviceResults.name) {
        establishmentData.MainServiceId = serviceResults.id;
      } else {
        throw new RegistrationException(
          `Lookup on services for '${establishmentData.MainService}' being cqc registered (${establishmentData.IsRegulated}) resulted with zero records`,
          responseErrors.unexpectedMainServiceId.errCode,
          responseErrors.unexpectedMainServiceId.errMessage,
        );
      }

      if (
        serviceResults.other &&
        establishmentData.MainServiceOther &&
        establishmentData.MainServiceOther.length > OTHER_MAX_LENGTH
      ) {
        throw new RegistrationException(
          `Other field value of '${establishmentData.MainServiceOther}' greater than length ${OTHER_MAX_LENGTH}`,
          responseErrors.unexpectedMainServiceId.errCode,
          responseErrors.unexpectedMainServiceId.errMessage,
        );
      }

      if (establishmentData.PostCode) {
        const { Latitude, Longitude } = (await models.postcodes.firstOrCreate(establishmentData.PostCode)) || {};

        establishmentData.Latitude = Latitude;
        establishmentData.Longitude = Longitude;
      }

      const newEstablishment = new Establishment.Establishment();
      newEstablishment.initialise(
        establishmentData.Address1,
        establishmentData.Address2,
        establishmentData.Address3,
        establishmentData.Town,
        establishmentData.County,
        establishmentData.LocationID,
        null, // PROV ID is not captured yet on registration
        establishmentData.PostCode,
        establishmentData.IsRegulated,
      );

      newEstablishment.initialiseSub(req.establishment.id, req.establishment.uid);

      await newEstablishment.load({
        name: establishmentData.Name,
        mainService: {
          id: establishmentData.MainServiceId,
          other: establishmentData.MainServiceOther,
        },
        Latitude: establishmentData.Latitude,
        Longitude: establishmentData.Longitude,
        ustatus: 'PENDING',
      });

      // no Establishment properties on registration
      if (newEstablishment.hasMandatoryProperties && newEstablishment.isValid) {
        await newEstablishment.save(req.username, 0, t);
        establishmentData.id = newEstablishment.id;
        establishmentData.eUID = newEstablishment.uid;
        establishmentData.NmdsId = newEstablishment.nmdsId;
      } else {
        // Establishment properties not valid
        throw new RegistrationException(
          'Inavlid establishment properties',
          responseErrors.invalidEstablishment.errCode,
          responseErrors.invalidEstablishment.errMessage,
        );
      }
      // post via Slack
      //get parent establishment details
      let fetchQuery = {
        where: {
          id: req.establishment.id,
        },
      };
      let parentEstablishment = await models.establishment.findOne(fetchQuery);
      const slackMsg = req.body;
      slackMsg.nmdsId = establishmentData.NmdsId;
      slackMsg.parentEstablishmentId = parentEstablishment.nmdsId;
      slackMsg.establishmentUid = establishmentData.eUID;
      slackMsg.username = req.username;
      slack.info('New Workplace', JSON.stringify(slackMsg, null, 2));
      // post through feedback topic - async method but don't wait for a responseThe
      sns.postToRegistrations(slackMsg);

      res.status(201);
      res.json({
        status: 1,
        message: 'Establishment successfully created',
        establishmentId: establishmentData.id,
        establishmentUid: establishmentData.eUID,
        nmdsId: establishmentData.nmdsId ? establishmentData.nmdsId : 'undefined',
      });
    });
  } catch (err) {
    console.error(err);
    console.error('Add establishment: rolling back all changes because: ', err.errCode, err.errMessage);
    if (err.errCode > -99) {
      console.error('Add establishment: original error: ', err.err);
    }

    if (err.errCode > -99) {
      // we have an unexpected error
      res.status(500);
    } else {
      // we have an expected error owing to given establishment data
      res.status(400);
    }
    res.json({
      status: err.errCode,
      message: err.errMessage,
    });
  }
};

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
const getEstablishment = async (req, res) => {
  const establishmentId = req.params.id;

  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline';
  const showHistoryTime = req.query.history === 'timeline';
  const showPropertyHistoryOnly = req.query.history === 'property';

  const thisEstablishment = new Establishment.Establishment(req.username);
  try {
    if (await thisEstablishment.restore(establishmentId, showHistory && req.query.history !== 'property')) {
      // the property based framework for "other services" and "capacity services"
      //  is returning "allOtherServices" and "allServiceCapacities"
      //  we don't want those on the root GET establishment; only necessary for the
      //  direct GET endpoints "establishment/:eid/service" and
      //  establishment/:eid/service respectively

      const jsonResponse = thisEstablishment.toJSON(
        showHistory,
        showPropertyHistoryOnly,
        showHistoryTime,
        false,
        true,
        null,
        false,
      );
      delete jsonResponse.allOtherServices;
      delete jsonResponse.allServiceCapacities;

      // If requested to via the wdf=true url parameter, evaluate and return the establishment's wdf field statuses
      if (req.query.wdf) {
        jsonResponse.wdf = await thisEstablishment.wdfToJson();
        jsonResponse.totalWorkers = await thisEstablishment.getTotalWorkers();
      }
      if (!jsonResponse.isParent && jsonResponse.parentUid !== null) {
        const parentEstablishmentName = await thisEstablishment.fetchParentDetails(jsonResponse.parentUid);
        if (parentEstablishmentName) {
          jsonResponse.parentName = parentEstablishmentName.parentName;
        }
      }
      return res.status(200).json(jsonResponse);
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
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::GET/:eID - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const deleteEstablishment = async (req, res) => {
  const establishmentId = req.params.id;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, false, true, 1)) {
      console.log('restored about to delete');
      await thisEstablishment.delete(req.username, null, true);
      return res.status(204).send();
    } else {
      console.log('404 not found that establishment');
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to delete Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::DELETE/:eID - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const updateEstablishment = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      if (req.body.PostCode && req.body.PostCode !== thisEstablishment.postcode) {
        const { Latitude, Longitude } = (await models.postcodes.firstOrCreate(req.body.PostCode)) || {};

        req.body.Latitude = Latitude;
        req.body.Longitude = Longitude;
      }

      const isValidEstablishment = await thisEstablishment.load(req.body);

      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);
        return res.status(200).json(thisEstablishment.toJSON(false, false, false, true));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error('Worker PUT: ', err);
    return res.status(500).send({});
  }
};

router.route('/:id').get(getEstablishment);
router.route('/:id').post(hasPermission('canAddEstablishment'), addEstablishment);
router.route('/:id').put(hasPermission('canEditEstablishment'), updateEstablishment);
router.route('/:id').delete(hasPermission('canDeleteEstablishment'), deleteEstablishment);

module.exports = router;

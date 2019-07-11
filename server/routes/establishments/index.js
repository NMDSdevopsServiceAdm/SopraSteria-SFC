// default route and registration of all sub routes
const express = require('express');
const router = express.Router();

const Authorization = require('../../utils/security/isAuthenticated');
const isLocal = require('../../utils/security/isLocalTest').isLocal;
const WdfUtils = require('../../utils/wdfEligibilityDate');

const concatenateAddress = require('../../utils/concatenateAddress').concatenateAddress;

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

const Approve = require('./approve');
const Reject = require('./reject');

const OTHER_MAX_LENGTH=120;

const responseErrors = {
    unexpectedMainServiceId: {
      errCode: -300,
      errMessage: 'Unexpected main service'
    },
    invalidEstablishment: {
      errCode: -700,
      errMessage: 'Establishment data is invalid'
    }
};

// approve/reject establishment (registration) requires an elevated privilede - override the authentication middleware before the default middleware
router.use('/:id/approve', Authorization.isAuthorisedRegistrationApproval, Approve);
router.use('/:id/reject', Authorization.isAuthorisedRegistrationApproval, Reject);

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


router.route('/:id').post(async (req, res) => {

    if (!req.body[0].isRegulated) {
        delete req.body[0].locationId;
    }

    const establishmentData = {
        Name : req.body[0].locationName,
        Address : concatenateAddress(req.body[0].addressLine1, req.body[0].addressLine2, req.body[0].townCity, req.body[0].county),
        LocationID: req.body[0].locationId,
        PostCode: req.body[0].postalCode,
        MainService: req.body[0].mainService,
        MainServiceId : null,
        MainServiceOther: req.body[0].mainServiceOther,
        IsRegulated: req.body[0].isRegulated
    };

    try {
        await models.sequelize.transaction(async t => {

          // Get the main service depending on whether the establishment is or is not cqc registered
          let serviceResults = null;
          if (establishmentData.IsRegulated) {
            serviceResults = await models.services.findOne({
              where: {
                name: estabslishmentData.MainService,
                isMain: true
              }
            });
          } else {
            serviceResults = await models.services.findOne({
              where: {
                name: establishmentData.MainService,
                iscqcregistered: false,
                isMain: true
              }
            });
          }

          if (serviceResults && serviceResults.id && (establishmentData.MainService === serviceResults.name)) {
            establishmentData.MainServiceId = serviceResults.id;
          } else {
            throw new RegistrationException(
              `Lookup on services for '${establishmentData.MainService}' being cqc registered (${establishmentData.IsRegulated}) resulted with zero records`,
              responseErrors.unexpectedMainServiceId.errCode,
              responseErrors.unexpectedMainServiceId.errMessage
            );
          }

          if (serviceResults.other && establishmentData.MainServiceOther && establishmentData.MainServiceOther.length > OTHER_MAX_LENGTH){
            throw new RegistrationException(
              `Other field value of '${establishmentData.MainServiceOther}' greater than length ${OTHER_MAX_LENGTH}`,
              responseErrors.unexpectedMainServiceId.errCode,
              responseErrors.unexpectedMainServiceId.errMessage
            );
          }

          const newEstablishment = new Establishment.Establishment();
          newEstablishment.initialise(
            establishmentData.Address,
            establishmentData.LocationID,
            establishmentData.PostCode,
            establishmentData.IsRegulated
          );

          newEstablishment.initialiseSub(req.establishment.id, req.establishment.uid);

          await newEstablishment.load({
            name: establishmentData.Name,
            mainService: {
              id: establishmentData.MainServiceId,
              other : establishmentData.MainServiceOther
            }
          });

          // no Establishment properties on registration
          if (newEstablishment.hasMandatoryProperties && newEstablishment.isValid) {
            await newEstablishment.save(req.username, 0, t);
            establishmentData.id = newEstablishment.id;
            establishmentData.eUID = newEstablishment.uid;
          } else {
            // Establishment properties not valid
            throw new RegistrationException(
              'Inavlid establishment properties',
              responseErrors.invalidEstablishment.errCode,
              responseErrors.invalidEstablishment.errMessage
            );
          }

          res.status(201);
          res.json({
            "status" : 1,
            "message" : "Establishment successfully created",
            "establishmentId" : establishmentData.id,
            "establishmentUid" : establishmentData.eUID,
            "nmdsId": newEstablishment.NmdsId ? newEstablishment.NmdsId : 'undefined'
          });


        });
    } catch (err) {
        console.log(err);
        console.error("Add establishment: rolling back all changes because: ", err.errCode, err.errMessage);
        if (err.errCode > -99) {
            console.error("Add establishment: original error: ", err.err);
        }

        if (err.errCode > -99) {
           // we have an unexpected error
            res.status(500);
        } else {
            // we have an expected error owing to given establishment data
            res.status(400);
        }
        res.json({
            "status" : err.errCode,
            "message" : err.errMessage
        });
    }
});

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.route('/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;
    const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
    const showHistoryTime = req.query.history === 'timeline' ? true : false;
    const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

    const thisEstablishment = new Establishment.Establishment(req.username);

    try {
        if (await thisEstablishment.restore(establishmentId, showHistory && req.query.history !== 'property')) {
            // the property based framework for "other services" and "capacity services"
            //  is returning "allOtherServices" and "allServiceCapacities"
            //  we don't want those on the root GET establishment; only necessary for the
            //  direct GET endpoints "establishment/:eid/service" and
            //  establishment/:eid/service respectively
            const jsonResponse = thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false)
            delete jsonResponse.allOtherServices;
            delete jsonResponse.allServiceCapacities;

            if (!showHistory) jsonResponse.wdf = await thisEstablishment.wdfToJson();

            // need also to return the WDF eligibility
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
            `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

        console.error('establishment::GET/:eID - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

router.route('/:id').delete(async (req, res) => {
    const establishmentId = req.establishmentId;
    const establishmentInstance = new Establishment.Establishment(req.username);

    try {
        if (await establishmentInstance.restore(establishmentId)) {
            console.log('restored about to delete');
            await establishmentInstance.delete(req.username);
            return res.status(204).send();
        } else {
            console.log('404 not found that establishment')
            return res.status(404).send('Not Found');
        }
    } catch (err) {
        const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
            thisEstablishment.id,
            thisEstablishment.uid,
            null,
            err,
            null,
            `Failed to delete Establishment with id/uid: ${establishmentId}`);

        console.error('establishment::DELETE/:eID - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

router.route('/:id').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
      if (await thisEstablishment.restore(establishmentId)) {
          // TODO: JSON validation

          // by loading after the restore, only those properties defined in the
          //  PUT body will be updated (peristed)
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
    console.error("Worker PUT: ", err);
    return res.status(503).send({});
  }
});


module.exports = router;

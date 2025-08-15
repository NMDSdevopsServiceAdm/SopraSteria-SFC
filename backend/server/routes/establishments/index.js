// default route and registration of all sub routes
const express = require('express');
const router = express.Router();
const Authorization = require('../../utils/security/isAuthenticated');
const { hasPermission } = require('../../utils/security/hasPermission');
const {
  addEstablishment,
  getEstablishment,
  deleteEstablishment,
  updateEstablishment,
} = require('../../services/establishment/establishment');

const MainService = require('./mainService');
const Services = require('./services');
const ServiceUsers = require('./serviceUsers');
const Capacity = require('./capacity');
const Jobs = require('./jobs');
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
const ExpiresSoonAlertDates = require('./expiresSoonAlertDates');
const ChildWorkplaces = require('./childWorkplaces');
const UpdateSingleEstablishmentField = require('./updateSingleEstablishmentField');
const Certificates = require('./certificates');
const TrainingAndQualifications = require('./trainingSummary');
const InternationalRecruitment = require('./internationalRecruitment');
const HasTrainingCertificates = require('./hasTrainingCertificates.js');
const CareWorkforcePathway = require('./careWorkforcePathway.js');
const EstablishmentField = require('./establishmentField.js');
const UpdateStaffKindDelegatedHealthcareActivities = require('./updateStaffKindDelegatedHealthcareActivities.js');

// ensure all establishment routes are authorised
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/mainService', MainService);
router.use('/:id/services', Services);
router.use('/:id/serviceUsers', ServiceUsers);
router.use('/:id/capacity', Capacity);
router.use('/:id/jobs', Jobs);
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
router.use('/:id/expiresSoonAlertDates', ExpiresSoonAlertDates);
router.use('/:id/childWorkplaces', ChildWorkplaces);
router.use('/:id/updateSingleEstablishmentField', UpdateSingleEstablishmentField);
router.use('/:id/certificate', Certificates);
router.use('/:id/trainingAndQualifications', TrainingAndQualifications);
router.use('/:id/internationalRecruitment', InternationalRecruitment);
router.use('/:id/hasTrainingCertificates', HasTrainingCertificates);
router.use('/:id/careWorkforcePathway', CareWorkforcePathway);
router.use('/:id/establishmentField', EstablishmentField);
router.use('/:id/updateStaffKindDelegatedHealthcareActivities', UpdateStaffKindDelegatedHealthcareActivities);

router.route('/:id').get(getEstablishment);
router.route('/:id').post(hasPermission('canAddEstablishment'), addEstablishment);
router.route('/:id').put(hasPermission('canEditEstablishment'), updateEstablishment);
router.route('/:id').delete(hasPermission('canDeleteEstablishment'), deleteEstablishment);

module.exports = router;

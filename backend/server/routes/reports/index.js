// default route for reports
const express = require('express');
const router = express.Router();

const isAdmin = require('../../utils/security/isAuthenticated').isAdmin;

const WDF = require('./wdf');
const WDFsummary = require('./wdfSummary');
const DailySnapshot = require('./dailySnapshot');
const LocalAuthority = require('./localAuthorityReport/index');
const DeleteReport = require('./deleteReport');
const RegistrationSurveyReport = require('./registrationSurveyReport');
const SatisfactionSurveyReport = require('./satisfactionSurveyReport');
const TrainingAndQualifications = require('./trainingAndQualifications');

router.use('/wdf', WDF);
router.use('/wdfSummary', WDFsummary);
router.use('/dailySnapshot', DailySnapshot);
router.use('/localAuthority', LocalAuthority);
router.use('/trainingAndQualifications', TrainingAndQualifications);
router.use('/delete', [isAdmin, DeleteReport]);
router.use('/registrationSurvey', [isAdmin, RegistrationSurveyReport]);
router.use('/satisfactionSurvey', [isAdmin, SatisfactionSurveyReport]);

router.route('/').get(async (req, res) => {
  return res.status(501).send();
});

module.exports = router;

// WDF summary report route
const express = require('express');
const router = express.Router();

// for database
const models = require('../../../models');

// security
const Authorization = require('../../../utils/security/isAuthenticated');

// WDF effective date
const WdfCalculator = require('../../../models/classes/wdfCalculator').WdfCalculator;

// gets requested establishment
router.use('/', Authorization.isAdminOrOnDemandReporting);
router.route('/').get(async (req, res) => {
  console.log("WA DEBUG - username - ", req.username ? req.username : 'not defined');
  const effectiveFrom = WdfCalculator.effectiveDate;
  try {

    const reportData = await models.sequelize.query(
                              `select * from cqc.wdfsummaryreport(:givenEffectiveDate)`,
                              {
                                replacements: {
                                  givenEffectiveDate: effectiveFrom
                                },
                                type: models.sequelize.QueryTypes.SELECT
                              }
                            );

    res.contentType = 'text/csv';
    return res.status(200).json(reportData.map(thisEstablishment => {
      console.log("WA DEBUG - this establishment: ", thisEstablishment)
      return {
        NmdsID: thisEstablishment.NmdsID,
        EstablishmentID: thisEstablishment.EstablishmentID,
        Address1: thisEstablishment.Address1,
        Address2: thisEstablishment.Address2,
        PostCode: thisEstablishment.PostCode,
        Region: thisEstablishment.Region,
        CSSR: thisEstablishment.CSSR,
        EstablishmentUpdated: thisEstablishment.EstablishmentUpdated,
        ParentID: thisEstablishment.ParentID,
        OverallWdfEligibility: thisEstablishment.OverallWdfEligibility,
        ParentNmdsID: thisEstablishment.ParentNmdsID,
        ParentEstablishmentID: thisEstablishment.ParentEstablishmentID,
        ParentName: thisEstablishment.ParentName,
        WorkerCount:thisEstablishment.WorkerCount,
        WorkerCompletedCount: thisEstablishment.WorkerCompletedCount,
      }
    }));

  } catch (err) {
    console.error('report/wdfSummary - failed', err);
    return res.status(503).send();
    }
});

module.exports = router;

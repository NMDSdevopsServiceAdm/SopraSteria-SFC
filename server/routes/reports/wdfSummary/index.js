// WDF summary report route
const express = require('express');
const UserAgentParser = require('ua-parser-js');
const router = express.Router();

// for database
const models = require('../../../models');

// security
const Authorization = require('../../../utils/security/isAuthenticated');

// WDF effective date
const WdfCalculator = require('../../../models/classes/wdfCalculator').WdfCalculator;

// local helper helper functions
const _csvQuote = (toCsv) => {
  if (toCsv === null) return '';

  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  } else {
    return toCsv;
  }
};
const _csvNoNull = (toCsv) => {
  if (toCsv) {
    return toCsv;
  } else {
    return '';
  }
};
const _fromDateToCsvDate = (convertThis) => {
  if (convertThis) {
    const datePart = convertThis.toISOString().substring(0,10);
    const dateParts = datePart.split('-');

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  } else {
    return '';
  }
};

// gets report
router.use('/', Authorization.isAdminOrOnDemandReporting);
router.route('/').get(async (req, res) => {
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? "\r\n" : "\n";

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


    if (reportData && Array.isArray(reportData)) {
      const date = new Date().toISOString().split('T')[0];
      res.setHeader('Content-disposition', 'attachment; filename=' + `${date}-sfc-wdf-summary-report.csv`);
      res.setHeader('Content-Type', 'text/csv');

      // first write the header for CSV
      res.write('NMDS-ID,\
Establishment ID,\
Establishment Name,\
Address 1,\
Address 2,\
Postcode,\
Region,\
CSSR,Updated Date,\
Number of workers,\
Number of fully completed and updated worker records,#workers,\
Percentage of fully completed and updated worker records,\
Date achieved eligibility,\
Is Eligible?,\
Parent Establishment NDMS-ID,\
Parent Establishment Name'+NEWLINE)

      reportData.map(thisEstablishment => {
        const percentageEligibleWorkers = thisEstablishment.WorkerCount > 0 ? Math.floor(thisEstablishment.WorkerCompletedCount / thisEstablishment.WorkerCount * 100) : 0;
        res.write(`${thisEstablishment.NmdsID},\
${thisEstablishment.EstablishmentID},\
${_csvQuote(thisEstablishment.EstablishmentName)},\
${_csvQuote(thisEstablishment.Address1)},\
${_csvQuote(thisEstablishment.Address2)},\
${thisEstablishment.PostCode},\
${thisEstablishment.Region},\
${thisEstablishment.CSSR},\
${_fromDateToCsvDate(thisEstablishment.EstablishmentUpdated)},\
${thisEstablishment.NumberOfStaff},\
${thisEstablishment.WorkerCompletedCount},\
${thisEstablishment.WorkerCount},\
${percentageEligibleWorkers},\
${_fromDateToCsvDate(thisEstablishment.OverallWdfEligibility)},\
${thisEstablishment.OverallWdfEligibility && thisEstablishment.OverallWdfEligibility.getTime() > WdfCalculator.effectiveTime ? 'Yes' : 'No'},\
${_csvNoNull(thisEstablishment.ParentNmdsID)},\
${_csvQuote(thisEstablishment.ParentName)}\
${NEWLINE}`);
      });

      return res.status(200).end();

    } else {
      res.status(503).send('Failed to rertrieve report');
    }

  } catch (err) {
    console.error('report/wdfSummary - failed', err);
    return res.status(503).send('ERR: Failed to rertrieve report');
    }
});

module.exports = router;

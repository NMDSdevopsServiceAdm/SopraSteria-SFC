// Local Authority admin report
// Local Authority admin report
const express = require('express');
const UserAgentParser = require('ua-parser-js');
const router = express.Router();
const reportLock = require('../../../utils/fileLock');
const moment = require('moment');

// for database
const models = require('../../../models');
const config = require('../../../config/config');

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
    const datePart = convertThis.toISOString().substring(0, 10);
    const dateParts = datePart.split('-');

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  } else {
    return '';
  }
};

// gets report
const reportGet = async (req, res) => {
  req.setTimeout(config.get('app.reports.localAuthority.timeout') * 1000);

  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? '\r\n' : '\n';
  const fromDate = config.get('app.reports.localAuthority.fromDate');
  const toDate = config.get('app.reports.localAuthority.toDate');

  try {
    const date = new Date().toISOString().split('T')[0];

    // write the report header
    let csvString =
      'Local Authority, \
Workplace ID,\
Number of parent account,\
Name of parent account(s),\
Latest update date,\
Status,\
Confirmed staff record numbers,\
Workplace data complete?,\
Staff records complete?,\
Number of workplaces/teams at these accounts,\
Number of complete workplaces/teams,\
Establishment Type,\
Main Service,\
Service User Group data,\
Capacity of Main Service,\
Utilisation of Main Service,\
Number of Staff Records (by job role),\
Number of Vacancies,\
Leavers in the past 12 months,\
Number of starters in the past 12 months,\
Number of staff records based on the organisation,\
Number of individual staff records,\
Number of individual staff records (not agency),\
Number of complete staff records (not agency),\
Percentage of complete staff reocrds (not agency),\
Number of individual agency records,\
Number of complete agency records,\
Percentage of complete agency staff records,\
Gender,\
Date of Birth,\
Ethinic Group,\
Main job role,\
Employment status,\
Contracted/Average hours,\
Sickness,\
Pay,\
Qualifications,\
Last Years confirmed numbers' +
      NEWLINE;

    const runReport = await models.sequelize.query(
      `select * from cqc.localAuthorityReportAdmin(:givenFromDate, :givenToDate);`,
      {
        replacements: {
          givenFromDate: fromDate,
          givenToDate: toDate,
        },
        type: models.sequelize.QueryTypes.SELECT,
      },
    );

    /*
    		"LocalAuthority" TEXT,
		"WorkplaceName" TEXT,
		"WorkplaceID" TEXT,
	 	"PrimaryEstablishmentID" INTEGER,
		"LastYearsConfirmedNumbers" INTEGER,
		"LatestUpdate" DATE,
		"WorkplacesCompleted" BIGINT,
		"StaffCompleted" BIGINT,
		"NumberOfWorkplaces" BIGINT,
    "NumberOfWorkplacesCompleted" BIGINT,
		"CountEstablishmentType" BIGINT,
		"CountMainService" BIGINT,
		"CountServiceUserGroups" BIGINT,
		"CountCapacity" BIGINT,
    "CountUiltisation" BIGINT,
		"CountNumberOfStaff" BIGINT,
		"CountVacancies" BIGINT,
		"CountStarters" BIGINT,
		"CountLeavers" BIGINT,
    "SumStaff" BIGINT,
		"CountIndividualStaffRecords" BIGINT,
		"CountOfIndividualStaffRecordsNotAgency" BIGINT,
		"CountOfIndividualStaffRecordsNotAgencyComplete" BIGINT,
		"PercentageNotAgencyComplete" DECIMAL(4,1),
		"CountOfIndividualStaffRecordsAgency" BIGINT,
		"CountOfIndividualStaffRecordsAgencyComplete" BIGINT,
    "PercentageAgencyComplete" DECIMAL(4,1),

		"CountOfGender" BIGINT,
		"CountOfDateOfBirth" BIGINT,
		"CountOfEthnicity" BIGINT,
		"CountOfMainJobRole" BIGINT,
		"CountOfEmploymentStatus" BIGINT,
		"CountOfContractedAverageHours" BIGINT,
		"CountOfSickness" BIGINT,
		"CountOfPay" BIGINT,
		"CountOfQualification" BIGINT
    */

    if (runReport && Array.isArray(runReport)) {
      runReport.forEach((thisPrimaryLaEstablishment) => {
        csvString =
          csvString +
          `${_csvQuote(thisPrimaryLaEstablishment.LocalAuthority)},\
${thisPrimaryLaEstablishment.WorkplaceID},\
1,\
${_csvQuote(thisPrimaryLaEstablishment.WorkplaceName)},\
${thisPrimaryLaEstablishment.LatestUpdate},\
,\
,\
${thisPrimaryLaEstablishment.WorkplacesCompleted},\
${thisPrimaryLaEstablishment.StaffCompleted},\
${thisPrimaryLaEstablishment.NumberOfWorkplaces},\
${thisPrimaryLaEstablishment.NumberOfWorkplacesCompleted},\
${thisPrimaryLaEstablishment.CountEstablishmentType},\
${thisPrimaryLaEstablishment.CountMainService},\
${thisPrimaryLaEstablishment.CountServiceUserGroups},\
${thisPrimaryLaEstablishment.CountCapacity},\
${thisPrimaryLaEstablishment.CountUiltisation},\
${thisPrimaryLaEstablishment.CountNumberOfStaff},\
${thisPrimaryLaEstablishment.CountVacancies},\
${thisPrimaryLaEstablishment.CountStarters},\
${thisPrimaryLaEstablishment.CountLeavers},\
${thisPrimaryLaEstablishment.SumStaff},\
${thisPrimaryLaEstablishment.CountIndividualStaffRecords},\
${thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgency},\
${thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgencyComplete},\
${
  thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgency > 0 &&
  thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgencyComplete > 0
    ? Math.floor(
        (thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgencyComplete /
          thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsNotAgency) *
          100,
      )
    : 0
},\
${thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgency},\
${thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgencyComplete},\
${
  thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgency > 0 &&
  thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgencyComplete > 0
    ? Math.floor(
        (thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgencyComplete /
          thisPrimaryLaEstablishment.CountOfIndividualStaffRecordsAgency) *
          100,
      )
    : 0
},\
${thisPrimaryLaEstablishment.CountOfGender},\
${thisPrimaryLaEstablishment.CountOfDateOfBirth},\
${thisPrimaryLaEstablishment.CountOfEthnicity},\
${thisPrimaryLaEstablishment.CountOfMainJobRole},\
${thisPrimaryLaEstablishment.CountOfEmploymentStatus},\
${thisPrimaryLaEstablishment.CountOfContractedAverageHours},\
${thisPrimaryLaEstablishment.CountOfSickness},\
${thisPrimaryLaEstablishment.CountOfPay},\
${thisPrimaryLaEstablishment.CountOfQualification},\
${thisPrimaryLaEstablishment.LastYearsConfirmedNumbers}` +
          NEWLINE;
      });
    }
    await reportLock.saveResponse(req, res, 200, csvString, {
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${moment(date).format(
        'YYYY-MM-DD',
      )}-SFC-Local-Authority-Admin-Report.csv`,
    });
  } catch (err) {
    console.error('report/localAuthority/admin - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
};

router.route('/report').get(reportLock.acquireLock.bind(null, 'la', reportGet, true));
router.route('/lockstatus').get(reportLock.lockStatusGet.bind(null, 'la', true));
router.route('/unlock').get(reportLock.releaseLock.bind(null, 'la', true));
router.route('/response/:buRequestId').get(reportLock.responseGet);
module.exports = router;

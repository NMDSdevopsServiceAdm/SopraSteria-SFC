'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const moment = require('moment');

const { _csvQuote, _csvNoNull, adminReportGet } = require('../../../../../routes/reports/localAuthorityReport/admin');
const models = require('../../../../../models');
const reportLock = require('../../../../../utils/fileLock');

describe('/server/routes/reports/localAuthorityReport/admin', () => {
  describe('reportGet()', () => {
    let getValue, query, saveResponse, saveResponseOutput, queryOutput;
    const startDate = '2021-08-11T00:00:00.000ZZ';
    const endDate = '2025-09-12T00:00:00.000ZZ';

    beforeEach(() => {
      getValue = sinon.stub(models.AdminSettings, 'getValue').callsFake(async (args) => {
        return {
          Data: {
            type: 'date',
            value: args === 'laReturnStartDate' ? startDate : endDate,
          },
        };
      });
      query = sinon.stub(models.sequelize, 'query').callsFake(async (query, options) => {
        queryOutput = {
          query,
          options,
        };
        return [
          {
            LocalAuthority: 'Bradford',
            WorkplaceName: 'Four Seasons Health Care Limited - Training Office FSHC',
            WorkplaceID: 'W1002065',
            PrimaryEstablishmentID: 1404,
            LastYearsConfirmedNumbers: 0,
            ThisYearsConfirmedNumbers: 0,
            Notes: null,
            Status: 'Not updated',
            LatestUpdate: '2021-06-29',
            WorkplacesCompleted: '0',
            StaffCompleted: '0',
            NumberOfWorkplaces: '153',
            NumberOfWorkplacesCompleted: '0',
            CountEstablishmentType: '0',
            CountMainService: '153',
            CountServiceUserGroups: '153',
            CountCapacity: '153',
            CountUiltisation: '111',
            CountNumberOfStaff: '152',
            CountVacancies: '153',
            CountStarters: '153',
            CountLeavers: '153',
            SumStaff: '9037',
            CountIndividualStaffRecords: '9219',
            CountOfIndividualStaffRecordsNotAgency: '9219',
            CountOfIndividualStaffRecordsNotAgencyComplete: '0',
            PercentageNotAgencyComplete: '0.00',
            CountOfIndividualStaffRecordsAgency: '0',
            CountOfIndividualStaffRecordsAgencyComplete: '0',
            PercentageAgencyComplete: '0.00',
            CountOfGender: '9219',
            CountOfDateOfBirth: '9210',
            CountOfEthnicity: '9206',
            CountOfMainJobRole: '9219',
            CountOfEmploymentStatus: '9219',
            CountOfContractedAverageHours: '9035',
            CountOfSickness: '9219',
            CountOfPay: '8738',
            CountOfQualification: '3',
          },
          {
            LocalAuthority: 'Kirklees',
            WorkplaceName: 'Bluebird Care Camden & Hampstead',
            WorkplaceID: 'H1002350',
            PrimaryEstablishmentID: 1686,
            LastYearsConfirmedNumbers: 7267,
            ThisYearsConfirmedNumbers: 1239,
            Notes: 'fjbdkjsbfkjdsb',
            Status: 'Update, complete',
            LatestUpdate: '2021-07-26',
            WorkplacesCompleted: '0',
            StaffCompleted: '0',
            NumberOfWorkplaces: '2',
            NumberOfWorkplacesCompleted: '0',
            CountEstablishmentType: '2',
            CountMainService: '2',
            CountServiceUserGroups: '2',
            CountCapacity: '2',
            CountUiltisation: '2',
            CountNumberOfStaff: '2',
            CountVacancies: '2',
            CountStarters: '2',
            CountLeavers: '2',
            SumStaff: '3',
            CountIndividualStaffRecords: '5',
            CountOfIndividualStaffRecordsNotAgency: '5',
            CountOfIndividualStaffRecordsNotAgencyComplete: '0',
            PercentageNotAgencyComplete: '0.00',
            CountOfIndividualStaffRecordsAgency: '0',
            CountOfIndividualStaffRecordsAgencyComplete: '0',
            PercentageAgencyComplete: '0.00',
            CountOfGender: '1',
            CountOfDateOfBirth: '4',
            CountOfEthnicity: '1',
            CountOfMainJobRole: '5',
            CountOfEmploymentStatus: '5',
            CountOfContractedAverageHours: '1',
            CountOfSickness: '1',
            CountOfPay: '1',
            CountOfQualification: '1',
          },
          {
            LocalAuthority: 'WOZiTech, with even more care',
            WorkplaceName: 'WOZiTech with even more care',
            WorkplaceID: 'G1001114',
            PrimaryEstablishmentID: 479,
            LastYearsConfirmedNumbers: 0,
            ThisYearsConfirmedNumbers: 0,
            Notes: null,
            Status: 'Not updated',
            LatestUpdate: '2021-06-29',
            WorkplacesCompleted: '0',
            StaffCompleted: '0',
            NumberOfWorkplaces: '12',
            NumberOfWorkplacesCompleted: '0',
            CountEstablishmentType: '3',
            CountMainService: '12',
            CountServiceUserGroups: '10',
            CountCapacity: '11',
            CountUiltisation: '10',
            CountNumberOfStaff: '11',
            CountVacancies: '11',
            CountStarters: '11',
            CountLeavers: '11',
            SumStaff: '105',
            CountIndividualStaffRecords: '37',
            CountOfIndividualStaffRecordsNotAgency: '37',
            CountOfIndividualStaffRecordsNotAgencyComplete: '0',
            PercentageNotAgencyComplete: '0.00',
            CountOfIndividualStaffRecordsAgency: '0',
            CountOfIndividualStaffRecordsAgencyComplete: '0',
            PercentageAgencyComplete: '0.00',
            CountOfGender: '23',
            CountOfDateOfBirth: '23',
            CountOfEthnicity: '23',
            CountOfMainJobRole: '37',
            CountOfEmploymentStatus: '37',
            CountOfContractedAverageHours: '25',
            CountOfSickness: '22',
            CountOfPay: '19',
            CountOfQualification: '21',
          },
        ];
      });
      saveResponse = sinon.stub(reportLock, 'saveResponse').callsFake(async (req, res, status, csv, options) => {
        saveResponseOutput = {
          status,
          csv,
          options,
        };
        return;
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    const request = {
      method: 'GET',
      url: '/api/reports/admin/report',
    };
    const req = httpMocks.createRequest(request);
    req.setTimeout = (value) => value;

    const res = httpMocks.createResponse();

    it('should save the report', async () => {
      await adminReportGet(req, res);

      sinon.assert.called(getValue);
      sinon.assert.calledOnce(query);
      expect(queryOutput.query).to.deep.equal(
        'select * from cqc.localAuthorityReportAdmin(:givenFromDate, :givenToDate) ORDER BY "LocalAuthority" ASC;',
      );
      expect(queryOutput.options).to.deep.equal({
        replacements: {
          givenFromDate: new Date(startDate),
          givenToDate: new Date(endDate),
        },
        type: models.sequelize.QueryTypes.SELECT,
      });
      sinon.assert.calledOnce(saveResponse);
      expect(saveResponseOutput.status).to.deep.equal(200);
      expect(saveResponseOutput.csv).to.deep.equal(
        'Local Authority, Workplace ID,Number of parent account,Name of parent account(s),Latest update date,Status,Confirmed staff record numbers,Workplace data complete?,Staff records complete?,Number of workplaces/teams at these accounts,Number of complete workplaces/teams,Establishment Type,Main Service,Service User Group data,Capacity of Main Service,Utilisation of Main Service,Number of Staff Records (by job role),Number of Vacancies,Leavers in the past 12 months,Number of starters in the past 12 months,Number of staff records based on the organisation,Number of individual staff records,Number of individual staff records (not agency),Number of complete staff records (not agency),Percentage of complete staff reocrds (not agency),Number of individual agency records,Number of complete agency records,Percentage of complete agency staff records,Gender,Date of Birth,Ethinic Group,Main job role,Employment status,Contracted/Average hours,Sickness,Pay,Qualifications,Last Years confirmed numbers,Notes\nBradford,W1002065,1,Four Seasons Health Care Limited - Training Office FSHC,2021-06-29,Not updated,0,0,0,153,0,0,153,153,153,111,152,153,153,153,9037,9219,9219,0,0,0,0,0,9219,9210,9206,9219,9219,9035,9219,8738,3,0,\nKirklees,H1002350,1,Bluebird Care Camden & Hampstead,2021-07-26,"Update, complete",1239,0,0,2,0,2,2,2,2,2,2,2,2,2,3,5,5,0,0,0,0,0,1,4,1,5,5,1,1,1,1,7267,fjbdkjsbfkjdsb\n"WOZiTech, with even more care",G1001114,1,WOZiTech with even more care,2021-06-29,Not updated,0,0,0,12,0,3,12,10,11,10,11,11,11,11,105,37,37,0,0,0,0,0,23,23,23,37,37,25,22,19,21,0,\n',
      );
      expect(saveResponseOutput.options).to.deep.equal({
        'Content-Type': 'text/csv',
        'Content-disposition': `attachment; filename=${moment().format(
          'YYYY-MM-DD',
        )}-SFC-Local-Authority-Admin-Report.csv`,
      });
    });

    it('should return a 500 on error', async () => {
      sinon.restore();

      sinon.stub(models.AdminSettings, 'getValue').throws();

      await adminReportGet(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('_csvQuote()', () => {
    it('should replace quotes with double quotes to escape them', () => {
      const string = 'Hello "I am Macintosh"';

      const quotedString = _csvQuote(string);

      expect(quotedString).to.deep.equal('"Hello ""I am Macintosh"""');
    });

    it('should return normal string if no quotes', () => {
      const string = 'Hello I am Macintosh';

      const quotedString = _csvQuote(string);

      expect(quotedString).to.deep.equal('Hello I am Macintosh');
    });

    it('should return empty string if null', () => {
      const string = null;

      const quotedString = _csvQuote(string);

      expect(quotedString).to.deep.equal('');
    });
  });

  describe('_csvNoNull()', () => {
    it('should return normal string if not null', () => {
      const string = 'Hello I am Macintosh';

      const quotedString = _csvNoNull(string);

      expect(quotedString).to.deep.equal('Hello I am Macintosh');
    });

    it('should return empty string if null', () => {
      const string = null;

      const quotedString = _csvNoNull(string);

      expect(quotedString).to.deep.equal('');
    });
  });
});

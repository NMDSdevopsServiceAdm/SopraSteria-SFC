'use strict';

const expect = require('chai').expect;

const testUtils = require('../../../../../utils/testUtils');

const fileName = 'server/routes/reports/wdf/parent.js';

const moment = require('moment');
const path = require('path');
const walk = require('walk');
const jsdom = require('jsdom');
const JsZip = require('jszip');
const fs = require('fs');

const readFile = filename =>
  (new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, filename), 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  }));

const { DOMParser, XMLSerializer } = new (jsdom.JSDOM)().window;

const parseXML = fileContent =>
  (new DOMParser()).parseFromString(fileContent.toString('utf8'), 'application/xml');

const serializeXML = dom =>
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  (new XMLSerializer()).serializeToString(dom);

const compressWhiteSpace = text => text.replace(/[ \t\r\n]+/g, ' ');

const validateXML = async (zip, filename, reference) => {
  const file = await zip.file(filename).async('string');

  expect(compressWhiteSpace(serializeXML(parseXML(file)))).to
    .equal(compressWhiteSpace(reference));
};

describe('/server/routes/reports/wdf/parent', () => {
  describe('get report', () => {
    it('should produce the proper xml files for the spreadsheet', async () => {
      let getReport;

      testUtils.sandBox(
        fileName,
        {
          locals: {
            require: testUtils.wrapRequire({
              moment,
              fs: {
                readFile: fs.readFile
              },
              path,
              walk,
              '../../../models/classes/establishment': {
                Establishment: function (username) {
                  expect(username).to.equal('username');

                  this.restore = (establishmentId, bulkUploadStatus) => {
                    expect(establishmentId).to.equal(479);
                    expect(bulkUploadStatus).to.equal(false);

                    return true;
                  };

                  this.isParent = true;
                  this.name = 'Establishment Name';
                }
              },
              '../../../models': {},
              jsdom,
              jszip: JsZip,
              express: {
                Router: () => ({
                  route: () => ({
                    get: endpoint => {
                      expect(endpoint).to.be.a('function');

                      getReport = endpoint;
                    }
                  })
                })
              }
            })
          },
          globals: {
            rfr: testUtils.wrapRequire({
              'server/data/parentWDFReport': {
                getEstablishmentData: () => [
                  {
                    EstablishmentID: 479,
                    NmdsID: 'G1001114',
                    SubsidiaryName: 'WOZiTech, with even more care',
                    EmployerTypeValue: 'Private Sector',
                    EmployerTypeSavedAt: new Date('2019-10-04T15:46:16.160Z'),
                    CurrentWdfEligibilityStatus: 'Not Eligible',
                    DateEligibilityAchieved: '',
                    MainService: 'Head office services',
                    MainServiceFKValue: 16,
                    TotalIndividualWorkerRecord: '19',
                    CompletedWorkerRecords: '18',
                    OtherServices: '',
                    ServiceUsers: '',
                    VacanciesValue: '1332',
                    StartersValue: 0,
                    LeaversValue: 0,
                    Capacities: '',
                    Utilisations: '',
                    NumberOfStaffValue: 45,
                    updated: new Date('2019-10-04T15:46:16.158Z'),
                    LastUpdatedDate: '04/10/2019',
                    ShareDataWithCQC: true,
                    ShareDataWithLA: true,
                    ReasonsForLeaving: '',
                    SubsidiarySharingPermissions: 'All',
                    EstablishmentDataFullyCompleted: 'No',
                    PercentageOfWorkerRecords: '8.6%',
                    LeavingReasonsCountEqualsLeavers: 'No',
                    TotalWorkersCountGTEWorkerRecords: 'Yes',
                    UpdatedInCurrentFinancialYear: 'No',
                    CompletedWorkerRecordsPercentage: '8.1%'
                  },
                  {
                    EstablishmentID: 573,
                    NmdsID: 'G1001213',
                    SubsidiaryName: 'Warren Care Non-CQC With eUID 5',
                    EmployerTypeValue: 'Local Authority (adult services)',
                    EmployerTypeSavedAt: new Date('2019-08-28T11:17:42.214Z'),
                    CurrentWdfEligibilityStatus: 'Not Eligible',
                    DateEligibilityAchieved: '02/08/2019',
                    MainService: 'Community support and outreach',
                    MainServiceFKValue: 2,
                    TotalIndividualWorkerRecord: '1',
                    CompletedWorkerRecords: '0',
                    OtherServices: 'Short breaks / respite care',
                    ServiceUsers: 'Carers, Carers',
                    VacanciesValue: 0,
                    StartersValue: 0,
                    LeaversValue: 0,
                    Capacities: '',
                    Utilisations: '',
                    NumberOfStaffValue: 1,
                    updated: new Date('2019-08-28T11:17:42.206Z'),
                    LastUpdatedDate: '28/08/2019',
                    ShareDataWithCQC: false,
                    ShareDataWithLA: false,
                    ReasonsForLeaving: '',
                    SubsidiarySharingPermissions: 'None',
                    EstablishmentDataFullyCompleted: 'No',
                    PercentageOfWorkerRecords: '0.0%',
                    LeavingReasonsCountEqualsLeavers: 'No',
                    TotalWorkersCountGTEWorkerRecords: 'Yes',
                    UpdatedInCurrentFinancialYear: 'No',
                    CompletedWorkerRecordsPercentage: '0.0%'
                  },
                  {
                    EstablishmentID: 1433,
                    NmdsID: 'G1002097',
                    SubsidiaryName: 'WOZiTech Cares Sub 3 Updated',
                    EmployerTypeValue: 'Voluntary / Charity',
                    EmployerTypeSavedAt: new Date('2019-10-04T15:46:16.927Z'),
                    CurrentWdfEligibilityStatus: 'Not Eligible',
                    DateEligibilityAchieved: '04/10/2019',
                    MainService: 'Carers support',
                    MainServiceFKValue: 1,
                    TotalIndividualWorkerRecord: '2',
                    CompletedWorkerRecords: '2',
                    OtherServices: '',
                    ServiceUsers: 'Adults',
                    VacanciesValue: 0,
                    StartersValue: '8',
                    LeaversValue: 0,
                    Capacities: '',
                    Utilisations: '',
                    NumberOfStaffValue: 1,
                    updated: new Date('2019-10-04T15:46:16.924Z'),
                    LastUpdatedDate: '04/10/2019',
                    ShareDataWithCQC: false,
                    ShareDataWithLA: false,
                    ReasonsForLeaving: '',
                    SubsidiarySharingPermissions: 'None',
                    EstablishmentDataFullyCompleted: 'No',
                    PercentageOfWorkerRecords: '0.0%',
                    LeavingReasonsCountEqualsLeavers: 'No',
                    TotalWorkersCountGTEWorkerRecords: 'No',
                    UpdatedInCurrentFinancialYear: 'No',
                    CompletedWorkerRecordsPercentage: '0.0%'
                  },
                  {
                    EstablishmentID: 1446,
                    NmdsID: 'G1002110',
                    SubsidiaryName: 'WOZiTech Cares Sub 100',
                    EmployerTypeValue: 'Private Sector',
                    EmployerTypeSavedAt: new Date('2019-10-04T15:46:16.801Z'),
                    CurrentWdfEligibilityStatus: 'Not Eligible',
                    DateEligibilityAchieved: '04/10/2019',
                    MainService: 'Carers support',
                    MainServiceFKValue: 1,
                    TotalIndividualWorkerRecord: '0',
                    CompletedWorkerRecords: '0',
                    OtherServices: '',
                    ServiceUsers: 'Older people',
                    VacanciesValue: 0,
                    StartersValue: 0,
                    LeaversValue: 0,
                    Capacities: '',
                    Utilisations: '',
                    NumberOfStaffValue: 1,
                    updated: new Date('2019-10-04T15:46:16.797Z'),
                    LastUpdatedDate: '04/10/2019',
                    ShareDataWithCQC: true,
                    ShareDataWithLA: true,
                    ReasonsForLeaving: '',
                    SubsidiarySharingPermissions: 'All',
                    EstablishmentDataFullyCompleted: 'No',
                    PercentageOfWorkerRecords: '0.0%',
                    LeavingReasonsCountEqualsLeavers: 'No',
                    TotalWorkersCountGTEWorkerRecords: 'Yes',
                    UpdatedInCurrentFinancialYear: 'No',
                    CompletedWorkerRecordsPercentage: '0.0%'
                  }
                ],
                getWorkerData: () => [
                  {
                    NameOrIdValue: 'Worker',
                    NameValue: 'WOZiTech Cares Sub 3 Updated',
                    GenderValue: 'Male',
                    DateOfBirthValue: '1971-11-29',
                    NationalityValue: 'British',
                    MainJobRole: 'Other job roles not directly involved in providing care',
                    MainJobStartDateValue: '2019-01-18',
                    RecruitedFromValue: 'No',
                    ContractValue: 'Pool/Bank',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: "Don't know",
                    DaysSickValue: 'Missing',
                    AnnualHourlyPayValue: 'Annually',
                    AnnualHourlyPayRate: '14000.00',
                    CareCertificateValue: 'No',
                    HighestQualificationHeld: '2011-01-01, 2011-01-01'
                  },
                  {
                    NameOrIdValue: 'Worker',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Male',
                    DateOfBirthValue: '1972-07-28',
                    NationalityValue: 'British',
                    MainJobRole: 'Senior Management',
                    MainJobStartDateValue: '2000-01-01',
                    RecruitedFromValue: 'Yes',
                    ContractValue: 'Temporary',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: 'Yes',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Hourly',
                    AnnualHourlyPayRate: '7.35',
                    CareCertificateValue: 'Yes, completed',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: 'Worker',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Male',
                    DateOfBirthValue: '1972-07-28',
                    NationalityValue: 'British',
                    MainJobRole: 'Senior Management',
                    MainJobStartDateValue: '2000-01-01',
                    RecruitedFromValue: 'Yes',
                    ContractValue: 'Temporary',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: 'Yes',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Hourly',
                    AnnualHourlyPayRate: '7.35',
                    CareCertificateValue: 'Yes, completed',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: 'Fat Tony',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Male',
                    DateOfBirthValue: '1973-07-29',
                    NationalityValue: 'British',
                    MainJobRole: 'Safeguarding & Reviewing Officer',
                    MainJobStartDateValue: '2000-01-18',
                    RecruitedFromValue: 'No',
                    ContractValue: 'Temporary',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: "Don't know",
                    DaysSickValue: 'No',
                    AnnualHourlyPayValue: 'Annually',
                    AnnualHourlyPayRate: '25545.00',
                    CareCertificateValue: 'No',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: 'Worker',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Female',
                    DateOfBirthValue: '1945-03-13',
                    NationalityValue: 'Other',
                    MainJobRole: 'Registered Nurse',
                    MainJobStartDateValue: '2012-04-06',
                    RecruitedFromValue: 'Yes',
                    ContractValue: 'Permanent',
                    WeeklyHoursContractedValue: 'Yes',
                    ZeroHoursContractValue: 'No',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Hourly',
                    AnnualHourlyPayRate: '10.00',
                    CareCertificateValue: 'Yes, completed',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '6',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Other',
                    DateOfBirthValue: '1978-12-12',
                    NationalityValue: 'British',
                    MainJobRole: 'Nursing Associate',
                    MainJobStartDateValue: '2006-08-18',
                    RecruitedFromValue: 'No',
                    ContractValue: 'Temporary',
                    WeeklyHoursContractedValue: 'No',
                    ZeroHoursContractValue: 'No',
                    DaysSickValue: 'Missing',
                    AnnualHourlyPayValue: 'Hourly',
                    AnnualHourlyPayRate: '10.11',
                    CareCertificateValue: 'No',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '4',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Female',
                    DateOfBirthValue: '1966-12-25',
                    NationalityValue: 'British',
                    MainJobRole: 'Activities worker or co-ordinator',
                    MainJobStartDateValue: '2000-01-01',
                    RecruitedFromValue: 'Yes',
                    ContractValue: 'Permanent',
                    WeeklyHoursContractedValue: 'Yes',
                    ZeroHoursContractValue: 'No',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Annually',
                    AnnualHourlyPayRate: '45600.00',
                    CareCertificateValue: 'Yes, completed',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '1',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Male',
                    DateOfBirthValue: '2000-01-01',
                    NationalityValue: 'British',
                    MainJobRole: 'Administrative / office staff not care-providing',
                    MainJobStartDateValue: '2019-01-01',
                    RecruitedFromValue: 'No',
                    ContractValue: 'Permanent',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: "Don't know",
                    DaysSickValue: 'No',
                    AnnualHourlyPayValue: "Don't know",
                    AnnualHourlyPayRate: 'Missing',
                    CareCertificateValue: 'No',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '10',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Missing',
                    DateOfBirthValue: 'Missing',
                    NationalityValue: 'Missing',
                    MainJobRole: 'Occupational Therapist',
                    MainJobStartDateValue: 'Missing',
                    RecruitedFromValue: 'Missing',
                    ContractValue: 'Permanent',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: 'Missing',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Missing',
                    AnnualHourlyPayRate: 'Missing',
                    CareCertificateValue: 'Yes, completed',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '5',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Missing',
                    DateOfBirthValue: 'Missing',
                    NationalityValue: "Don't know",
                    MainJobRole: 'Assessment Officer',
                    MainJobStartDateValue: 'Missing',
                    RecruitedFromValue: 'Missing',
                    ContractValue: 'Pool/Bank',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: 'Missing',
                    DaysSickValue: 'Missing',
                    AnnualHourlyPayValue: 'Missing',
                    AnnualHourlyPayRate: 'Missing',
                    CareCertificateValue: 'Missing',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  },
                  {
                    NameOrIdValue: '3',
                    NameValue: 'WOZiTech, with even more care',
                    GenderValue: 'Missing',
                    DateOfBirthValue: '1990-01-06',
                    NationalityValue: 'Missing',
                    MainJobRole: 'Care Worker',
                    MainJobStartDateValue: 'Missing',
                    RecruitedFromValue: 'Missing',
                    ContractValue: 'Permanent',
                    WeeklyHoursContractedValue: 'Missing',
                    ZeroHoursContractValue: 'No',
                    DaysSickValue: 'Yes',
                    AnnualHourlyPayValue: 'Missing',
                    AnnualHourlyPayRate: 'Missing',
                    CareCertificateValue: 'Missing',
                    HighestQualificationHeld: '2010-09-01, 2011-01-01, 2010-09-01, 2011-01-01, 2010-09-01'
                  }
                ]
              }
            }),
            'Date': testUtils.mockDate(2019, 10, 7)
          }
        }
      );

      expect(getReport).to.be.a('function');

      const req = {
        username: 'username',
        establishment: {
          id: 479
        }
      };

      let response;

      const res = new function () {
        const obj = {
          status: code => {
            expect(code).to.equal(200);

            return obj;
          },
          setHeader: () => {
            return obj;
          },
          end: data => {
            response = data;

            return obj;
          }
        };

        return obj;
      }();

      await getReport(req, res);

      expect(response).to.be.instanceOf(Buffer);

      const zip = new JsZip();
      const unzipped = await zip.loadAsync(response);

      expect(Object.keys(unzipped.files).join(',')).to.equal('[Content_Types].xml,xl/,xl/styles.xml,xl/workbook.xml,xl/worksheets/,' +
      'xl/worksheets/_rels/,xl/worksheets/_rels/sheet1.xml.rels,xl/worksheets/_rels/sheet2.xml.rels,xl/worksheets/_rels/sheet3.xml.rels,' +
      'xl/theme/,xl/theme/theme1.xml,xl/_rels/,xl/_rels/workbook.xml.rels,docProps/,docProps/app.xml,docProps/core.xml,_rels/,_rels/.rels,' +
      'xl/worksheets/sheet1.xml,xl/worksheets/sheet2.xml,xl/worksheets/sheet3.xml,xl/sharedStrings.xml');

      const references = {
        'xl/worksheets/sheet1.xml': await readFile('parentSheet1.xml'),
        'xl/worksheets/sheet2.xml': await readFile('parentSheet2.xml'),
        'xl/worksheets/sheet3.xml': await readFile('parentSheet3.xml')
      };

      await Promise.all(Object.keys(unzipped.files).map(async filename => {
        switch (filename) {
          case 'xl/worksheets/sheet1.xml': {
            await validateXML(zip, filename, references[filename]);
          } break;

          case 'xl/worksheets/sheet2.xml': {
            await validateXML(zip, filename, references[filename]);
          } break;

          case 'xl/worksheets/sheet3.xml': {
            await validateXML(zip, filename, references[filename]);
          } break;
        }
      }));
    });
  });
});

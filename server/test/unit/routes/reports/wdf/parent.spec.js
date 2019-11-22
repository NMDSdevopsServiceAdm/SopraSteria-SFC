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
const isWindows = require('is-windows');

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
                getCapicityData: () => [
                  {
                    "Answer": 10,
                    "ServiceID": 12,
                    "EstablishmentID": 479,
                    "Type": "Capacity"
                  }
                ],
                getUtilisationData: () => [
                  {
                    "Answer": 10,
                    "ServiceID": 12,
                    "EstablishmentID": 479,
                    "Type": "Utilisation"
                  }
                ],
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 5',
                    OtherQualificationsValue: 'Yes'

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
                    QualificationInSocialCareValue: 'No',
                    QualificationInSocialCare: 'Level 2',
                    OtherQualificationsValue: 'No'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 3',
                    OtherQualificationsValue: 'Missing'
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
                    QualificationInSocialCareValue: 'Missing',
                    QualificationInSocialCare: 'Missing',
                    OtherQualificationsValue: 'Missing'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 7',
                    OtherQualificationsValue: 'Missing'
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
                    QualificationInSocialCareValue: 'No',
                    QualificationInSocialCare: 'Missing',
                    OtherQualificationsValue: 'Yes'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 5',
                    OtherQualificationsValue: 'Yes'
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
                    QualificationInSocialCareValue: 'No',
                    QualificationInSocialCare: 'Level 5',
                    OtherQualificationsValue: 'No'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 10',
                    OtherQualificationsValue: 'Yes'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Level 5',
                    OtherQualificationsValue: 'Missing'
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
                    QualificationInSocialCareValue: 'Yes',
                    QualificationInSocialCare: 'Missing',
                    OtherQualificationsValue: 'Yes'
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
      let rels = path.join('_rels', '.rels');
      let xl = 'xl/';
      let worksheets = 'xl/worksheets/';
      let worksheet_rels = 'xl/worksheets/_rels/';
      let themeFolder = 'xl/theme/';
      let xl_rels = 'xl/_rels/';
      let docProps = 'docProps/';
      let _rels = '_rels/';
      let styles = path.join('xl', 'styles.xml');
      let workbook = path.join('xl', 'workbook.xml');
      let relWorkbook = path.join('xl', '_rels', 'workbook.xml.rels');
      let relSheet1 = path.join('xl', 'worksheets', '_rels', 'sheet1.xml.rels');
      let relSheet2 = path.join('xl', 'worksheets', '_rels', 'sheet2.xml.rels');
      let relSheet3 = path.join('xl', 'worksheets', '_rels', 'sheet3.xml.rels');
      let theme = path.join('xl', 'theme', 'theme1.xml');
      let app = path.join('docProps', 'app.xml');
      let core = path.join('docProps', 'core.xml');
      let sheet1 = path.join('xl', 'worksheets', 'sheet1.xml');
      let sheet2 = path.join('xl', 'worksheets', 'sheet2.xml');
      let sheet3 = path.join('xl', 'worksheets', 'sheet3.xml');
      let sharedSheet = path.join('xl', 'sharedStrings.xml');
      let expectedOutput;

      if(isWindows()){
        expectedOutput = ['[Content_Types].xml', rels, styles, workbook, relWorkbook, relSheet1, relSheet2, relSheet3, theme, app, core, sheet1, sheet2, sheet3, sharedSheet].join(',');
      }else{
        expectedOutput = ['[Content_Types].xml', xl, styles, workbook, worksheets, worksheet_rels, relSheet1, relSheet2, relSheet3, themeFolder, theme, xl_rels, relWorkbook,
         docProps, app, core, _rels, rels, sheet1, sheet2, sheet3, sharedSheet].join(',');
      }

      expect(Object.keys(unzipped.files).join(',')).to.equal(expectedOutput);

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

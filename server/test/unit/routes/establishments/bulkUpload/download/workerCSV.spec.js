const expect = require('chai').expect;

const BUDI = require('../../../../../../models/BulkImport/BUDI').BUDI;
const yesNoDontKnow = require('../../../../mockdata/workers').yesNoDontKnow;
const { apiWorkerBuilder } = require('../../../../../integration/utils/worker');

const workers = [apiWorkerBuilder(), apiWorkerBuilder(), apiWorkerBuilder()];

const sandbox = require('sinon').createSandbox();

const {
  toCSV,
  _maptoCSVregisteredNurse,
} = require('../../../../../../routes/establishments/bulkUpload/download/workerCSV');

const establishment = {
  id: 123,
  LocalIdentifierValue: 'Test McTestface',
};

describe('workerCSV', () => {
  describe('toCSV', () => {
    beforeEach(() => {
      sandbox.stub(BUDI, 'ethnicity').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'nationality').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'country').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'recruitment').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'jobRoles').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'nursingSpecialist').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'qualificationLevels').callsFake((method, value) => value);
      sandbox.stub(BUDI, 'qualifications').callsFake((method, value) => value);
    });
    afterEach(() => {
      sandbox.restore();
    });

    workers.forEach((worker, index) => {
      describe('worker' + index, () => {
        it('should return basic CSV info in expected order', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[0]).to.equal(establishment.LocalIdentifierValue);
          expect(csvAsArray[1]).to.equal(worker.LocalIdentifierValue);
          expect(csvAsArray[2]).to.equal('UNCHECKED');
          expect(csvAsArray[3]).to.equal(worker.NameOrIdValue);
        });
        yesNoDontKnow.forEach((value) => {
          it('should return return flu vaccine information ' + value.value, async () => {
            let fluvac = '';
            worker.FluJabValue = value.value;
            switch (worker.FluJabValue) {
              case 'Yes':
                fluvac = '1';
                break;

              case 'No':
                fluvac = '2';
                break;

              case "Don't know":
                fluvac = '999';
                break;
            }
            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[4]).to.equal(fluvac);
          });
        });
        it('should return national insurance number', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal(worker.NationalInsuranceNumberValue);
        });
        it('should return sanitised national insurance number if download-type is workers-sanitise', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('Admin');
        });
        it('should return blank if no national insurance number', async () => {
          worker.NationalInsuranceNumberValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('');
        });
        it('should return blank if no national insurance number and if download-type is workers-sanitise', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[5]).to.equal('');
        });
        it('should return postcode', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[6]).to.equal(worker.PostcodeValue);
        });
        it('should return dob', async () => {
          const dobParts = worker.DateOfBirthValue.split('-');
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal(`${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`);
        });
        it('should return sanitised dob if download-type is workers-sanitise', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('Admin');
        });
        it('should return blank if no dob', async () => {
          worker.DateOfBirthValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
        it('return blank if no dob and if download-type is workers-sanitise', async () => {
          worker.DateOfBirthValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3, 'workersSanitise');
          const csvAsArray = csv.split(',');

          expect(csvAsArray[7]).to.equal('');
        });
        [
          {
            name: 'Female',
            code: '2',
          },
          {
            name: 'Male',
            code: '1',
          },
          {
            name: 'Other',
            code: '4',
          },
          {
            name: "Don't know",
            code: '3',
          },
        ].forEach((value) => {
          it('should return correct gender for ' + value.name, async () => {
            worker.GenderValue = value.name;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[8]).to.equal(value.code);
          });
        });
        it('should return the correct ethnicity code', async () => {
          worker.ethnicity = {
            id: '123',
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[9]).to.equal(worker.ethnicity.id);
        });
        it('should be blank if no ethnicity', async () => {
          worker.ethnicity = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[9]).to.equal('');
        });
        [
          {
            name: 'British',
            code: '826',
          },
          {
            name: "Don't know",
            code: '998',
          },
          {
            name: 'Other',
            code: '999',
          },
        ].forEach((nationality) => {
          it('should return the correct code for nationality ' + nationality.name, async () => {
            worker.NationalityValue = nationality.name;
            worker.nationality = null;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[10]).to.equal(nationality.code);
          });
        });
        it('should return the correct code for nationality with other value', async () => {
          worker.NationalityValue = 'Other';
          worker.nationality = {
            id: '134',
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[10]).to.equal(worker.nationality.id);
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for british citizenship ' + value.value, async () => {
            worker.BritishCitizenshipValue = value.value;

            let britishCitizenship = '';
            switch (worker.BritishCitizenshipValue) {
              case 'Yes':
                britishCitizenship = '1';
                break;

              case 'No':
                britishCitizenship = '2';
                break;

              case "Don't know":
                britishCitizenship = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[11]).to.equal(britishCitizenship);
          });
        });
        [
          {
            name: 'United Kingdom',
            code: '826',
          },
          {
            name: "Don't know",
            code: '998',
          },
          {
            name: 'Other',
            code: '999',
          },
        ].forEach((country) => {
          it('should return the correct code for country of birth ' + country.name, async () => {
            worker.CountryOfBirthValue = country.name;
            worker.countryOfBirth = null;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[12]).to.equal(country.code);
          });
        });
        it('should return the correct code for country of birth with other value', async () => {
          worker.CountryOfBirthValue = 'Other';
          worker.countryOfBirth = {
            id: '458',
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[12]).to.equal(worker.countryOfBirth.id);
        });
        it('should return the correct code for year arrived year', async () => {
          worker.YearArrivedValue = 'Yes';
          worker.YearArrivedYear = '1998';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[13]).to.equal(worker.YearArrivedYear);
        });
        it('should not return year if the year arrived is no', async () => {
          worker.YearArrivedValue = 'No';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[13]).to.equal('');
        });
        [
          {
            name: 'Yes',
            code: '1',
          },
          {
            name: 'No',
            code: '0',
          },
          {
            name: 'Undisclosed',
            code: '2',
          },
          {
            name: "Don't know",
            code: '3',
          },
        ].forEach((disability) => {
          it('should return the correct code for disability ' + disability.name, async () => {
            worker.DisabilityValue = disability.name;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[14]).to.equal(disability.code);
          });
        });
        [
          {
            name: 'Yes, completed',
            code: '1',
          },
          {
            name: 'No',
            code: '2',
          },
          {
            name: 'Yes, in progress or partially completed',
            code: '3',
          },
        ].forEach((careCert) => {
          it('should return the correct code for care certificate ' + careCert.name, async () => {
            worker.CareCertificateValue = careCert.name;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[15]).to.equal(careCert.code);
          });
        });
        it('should return the correct code for no in recruitment source', async () => {
          worker.RecruitedFromValue = 'No';
          worker.recruitedFrom = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[16]).to.equal('16');
        });
        it('should return the correct code for recruitment source', async () => {
          worker.RecruitedFromValue = 'Yes';
          worker.recruitedFrom = {
            id: '1789',
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[16]).to.equal('1789');
        });
        it('should return start date', async () => {
          const startDateParts = worker.MainJobStartDateValue.split('-');
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[17]).to.equal(`${startDateParts[2]}/${startDateParts[1]}/${startDateParts[0]}`);
        });
        it('should return blank if no start date', async () => {
          worker.MainJobStartDateValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[17]).to.equal('');
        });
        it('should return the correct code for social care start date', async () => {
          worker.SocialCareStartDateValue = 'Yes';
          worker.SocialCareStartDateYear = '1998';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[18]).to.equal(worker.YearArrivedYear);
        });
        it('should not return year if the social care start date is no', async () => {
          worker.SocialCareStartDateValue = 'No';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[18]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for apprenticeship ' + value.value, async () => {
            worker.ApprenticeshipTrainingValue = value.value;

            let apprenticeship = '';
            switch (worker.ApprenticeshipTrainingValue) {
              case 'Yes':
                apprenticeship = '1';
                break;

              case 'No':
                apprenticeship = '2';
                break;

              case "Don't know":
                apprenticeship = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[19]).to.equal(apprenticeship);
          });
        });
        [
          {
            name: 'Permanent',
            code: '1',
          },
          {
            name: 'Temporary',
            code: '2',
          },
          {
            name: 'Pool/Bank',
            code: '3',
          },
          {
            name: 'Agency',
            code: '4',
          },
          {
            name: 'Other',
            code: '7',
          },
        ].forEach((empStatus) => {
          it('should return employment status ' + empStatus.name, async () => {
            worker.ContractValue = empStatus.name;

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[20]).to.equal(empStatus.code);
          });
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for zero hours ' + value.value, async () => {
            worker.ZeroHoursContractValue = value.value;

            let zeroHours = '';
            switch (worker.ZeroHoursContractValue) {
              case 'Yes':
                zeroHours = '1';
                break;

              case 'No':
                zeroHours = '2';
                break;

              case "Don't know":
                zeroHours = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[21]).to.equal(zeroHours);
          });
        });
        it('should return the correct number of sick days if Yes', async () => {
          worker.DaysSickValue = 'Yes';
          worker.DaysSickDays = '4';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[22]).to.equal(worker.DaysSickDays);
        });
        it('should not return days if the sick value is no', async () => {
          worker.SocialCareStartDateValue = 'No';
          worker.DaysSickDays = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[22]).to.equal('');
        });
        it('should return hourly value and rate', async () => {
          worker.AnnualHourlyPayValue = 'Hourly';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('3');
          expect(csvAsArray[24]).to.equal('');
          expect(csvAsArray[25]).to.equal(String(worker.AnnualHourlyPayRate));
        });
        it('should return annual value and rate', async () => {
          worker.AnnualHourlyPayValue = 'Annually';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('1');
          expect(csvAsArray[24]).to.equal(String(worker.AnnualHourlyPayRate));
          expect(csvAsArray[25]).to.equal('');
        });
        it('should not return annual/hourly value or rate', async () => {
          worker.AnnualHourlyPayValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[23]).to.equal('');
          expect(csvAsArray[24]).to.equal('');
          expect(csvAsArray[25]).to.equal('');
        });
        it('should return main job id', async () => {
          worker.mainJob = {
            id: '987',
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[26]).to.equal(worker.mainJob.id);
        });
        it('should not return main job id', async () => {
          worker.mainJob = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[26]).to.equal('');
        });
        it('should return main job other value', async () => {
          worker.mainJob = {
            other: true,
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal(worker.MainJobFkOther);
        });
        it('should not return main job other value', async () => {
          worker.mainJob = {
            other: false,
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal('');
        });
        it('should not return main job other value', async () => {
          worker.mainJob = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[27]).to.equal('');
        });
        ['Permanent', 'Temporary'].forEach((contract) => {
          it('should return contracted hours if the contract is ' + contract, async () => {
            worker.ContractValue = contract;
            worker.WeeklyHoursContractedValue = 'Yes';
            worker.ZeroHoursContractValue = 'No';

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[28]).to.equal(String(worker.WeeklyHoursContractedHours));
          });
        });
        it('should not return contracted hours if the contract is Agency', async () => {
          worker.ContractValue = 'Agency';
          worker.WeeklyHoursContractedValue = 'No';
          worker.ZeroHoursContractValue = 'Yes';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[28]).to.equal('');
        });
        ['Pool/Bank', 'Agency', 'Other'].forEach((contract) => {
          it('should return average hours if the contract is ' + contract, async () => {
            worker.ContractValue = contract;
            worker.WeeklyHoursAverageValue = 'Yes';
            worker.ZeroHoursContractValue = 'Yes';

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[29]).to.equal(String(worker.WeeklyHoursAverageHours));
          });
        });
        it('should not return average hours if the contract is Temporary', async () => {
          worker.ContractValue = 'Temporary';
          worker.WeeklyHoursAverageValue = null;
          worker.ZeroHoursContractValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[29]).to.equal('');
        });
        it('should return other jobs if other jobs value is Yes', async () => {
          worker.OtherJobsValue = 'Yes';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal(String(worker.otherJobs[0].id));
        });
        it('should not return other jobs if other jobs value is No', async () => {
          worker.OtherJobsValue = 'No';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal('');
        });
        it('should not return other jobs if other jobs value is null', async () => {
          worker.OtherJobsValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[30]).to.equal('');
        });
        it('should return other jobs desc if other jobs value is Yes and is an other value', async () => {
          worker.OtherJobsValue = 'Yes';
          worker.otherJobs[0].other = true;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal(worker.otherJobs[0].workerJobs.other);
        });
        it('should not return other jobs desc if other jobs value is No', async () => {
          worker.OtherJobsValue = 'No';

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal('');
        });
        it('should not return other jobs desc if other jobs value is null', async () => {
          worker.OtherJobsValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[31]).to.equal('');
        });
        [
          {
            name: 'Adult Nurse',
            code: '01',
          },
          {
            name: 'Mental Health Nurse',
            code: '02',
          },
          {
            name: 'Learning Disabilities Nurse',
            code: '03',
          },
          {
            name: "Children's Nurse",
            code: '04',
          },
          {
            name: 'Enrolled Nurse',
            code: '05',
          },
        ].forEach((regNurse) => {
          it(
            'should return registered nurse value if main job is nurse and they have registered value of ' +
              regNurse.name,
            async () => {
              worker.RegisteredNurseValue = regNurse.name;
              worker.mainJob = {
                id: 23,
              };

              const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
              const csvAsArray = csv.split(',');

              expect(csvAsArray[32]).to.equal(regNurse.code);
            },
          );
        });
        it("should not return registered nurse value if main job is nurse and they don't have reg value", async () => {
          worker.RegisteredNurseValue = null;
          worker.mainJob = {
            id: 23,
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[32]).to.equal('');
        });
        it("should return reistered nurse value if main job is nurse and they don't have reg value", async () => {
          worker.RegisteredNurseValue = 'Adult Nurse';
          worker.mainJob = {
            id: 24,
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[32]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code nurse specialism ' + value.value, async () => {
            worker.mainJob = {
              id: 23,
            };
            worker.NurseSpecialismsValue = value.value;
            worker.nurseSpecialisms = [
              {
                id: '138',
              },
              {
                id: '23',
              },
            ];
            let nurseSpec = '';
            switch (worker.NurseSpecialismsValue) {
              case 'Yes':
                nurseSpec = `${worker.nurseSpecialisms[0].id};${worker.nurseSpecialisms[1].id}`;
                break;

              case 'No':
                nurseSpec = '7';
                break;

              case "Don't know":
                nurseSpec = '8';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[33]).to.equal(nurseSpec);
          });
        });
        it('should not return a code for nurse specialism if not a nurse', async () => {
          worker.NurseSpecialismsValue = 'No';
          worker.mainJob = {
            id: 24,
          };

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[33]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code for approved mental health worker ' + value.value, async () => {
            worker.ApprovedMentalHealthWorkerValue = value.value;

            let amhp = '';
            switch (worker.ApprovedMentalHealthWorkerValue) {
              case 'Yes':
                amhp = '1';
                break;

              case 'No':
                amhp = '2';
                break;

              case "Don't know":
                amhp = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[34]).to.equal(amhp);
          });
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code sc qual ' + value.value, async () => {
            worker.QualificationInSocialCareValue = value.value;
            worker.socialCareQualification = [
              {
                id: '239',
              },
            ];
            let scqual = '';
            switch (worker.QualificationInSocialCareValue) {
              case 'Yes':
                scqual = `1;${worker.socialCareQualification.id}`;
                break;
              case 'No':
                scqual = '2';
                break;

              case "Don't know":
                scqual = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[35]).to.equal(scqual);
          });
          it('should not return the correct code sc qual ' + value.value, async () => {
            worker.QualificationInSocialCareValue = value.value;
            worker.socialCareQualification = null;
            let scqual = '';
            switch (worker.QualificationInSocialCareValue) {
              case 'Yes':
                scqual = '1';
                break;
              case 'No':
                scqual = '2';
                break;

              case "Don't know":
                scqual = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[35]).to.equal(scqual);
          });
        });
        it('should not return the correct code sc qual', async () => {
          worker.QualificationInSocialCareValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[35]).to.equal('');
        });
        yesNoDontKnow.forEach((value) => {
          it('should return the correct code non sc qual ' + value.value, async () => {
            worker.OtherQualificationsValue = value.value;
            worker.highestQualification = [
              {
                id: '239',
              },
            ];
            let nonscqual = '';
            switch (worker.OtherQualificationsValue) {
              case 'Yes':
                nonscqual = `1;${worker.highestQualification.id}`;
                break;
              case 'No':
                nonscqual = '2';
                break;

              case "Don't know":
                nonscqual = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[36]).to.equal(nonscqual);
          });
          it('should not return the correct code non sc qual ' + value.value, async () => {
            worker.OtherQualificationsValue = value.value;
            worker.highestQualification = null;
            let nonscqual = '';
            switch (worker.OtherQualificationsValue) {
              case 'Yes':
                nonscqual = '1';
                break;
              case 'No':
                nonscqual = '2';
                break;

              case "Don't know":
                nonscqual = '999';
                break;
            }

            const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
            const csvAsArray = csv.split(',');

            expect(csvAsArray[36]).to.equal(nonscqual);
          });
        });
        it('should not return the correct code non sc qual', async () => {
          worker.OtherQualificationsValue = null;

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[36]).to.equal('');
        });
        it('should return the correct code and year for qual 01', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[37]).to.equal(
            `${worker.qualifications[0].qualification.id};${worker.qualifications[0].year}`,
          );
        });
        it('should return the correct notes for qual 01 notes', async () => {
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[38]).to.equal(worker.qualifications[0].notes);
        });
        it('should return the unescaped notes for qual 01 notes', async () => {
          worker.qualifications[0].notes = '%EA%E9';
          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[38]).to.equal('êé');
        });
        it('should return the correct code and year for qual 01', async () => {
          worker.qualifications = [];

          const csv = toCSV(establishment.LocalIdentifierValue, worker, 3);
          const csvAsArray = csv.split(',');

          expect(csvAsArray[37]).to.equal('');
        });
      });
    });
  });

  describe('_maptoCSVregisteredNurse()', () => {
    const valuesAndMappings = [
      {
        value: 'Adult Nurse',
        mappedValue: '01',
      },
      {
        value: 'Mental Health Nurse',
        mappedValue: '02',
      },
      {
        value: 'Learning Disabilities Nurse',
        mappedValue: '03',
      },
      {
        value: "Children's Nurse",
        mappedValue: '04',
      },
      {
        value: 'Enrolled Nurse',
        mappedValue: '05',
      },
    ];

    valuesAndMappings.forEach((pair) => {
      it(`should return ${pair.mappedValue} when ${pair.value} passed in`, () => {
        expect(_maptoCSVregisteredNurse(pair.value)).to.equal(pair.mappedValue);
      });
    });

    it('should return empty string when invalid value passed in', () => {
      expect(_maptoCSVregisteredNurse('Hello')).to.equal('');
    });
  });
});

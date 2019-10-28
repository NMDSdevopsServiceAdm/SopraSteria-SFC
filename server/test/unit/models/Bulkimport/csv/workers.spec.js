const expect = require('chai').expect;
const bulkupload = require('../../../../../models/BulkImport/csv/workers').Worker;
const workers = require('../../../mockdata/workers').data;
const establishmentId = require('../../../mockdata/workers').establishmentId;
const maxquals = require('../../../mockdata/workers').maxquals;
const knownHeaders = require('../../../mockdata/workers').knownHeaders;

function mapCsvToWorker(worker, headers) {
  const mapped = {};
  headers.forEach((header, index) => {
    mapped[header] = worker[index];
  });
  return mapped;
}

describe('/server/models/Bulkimport/csv/workers.js', () => {
  const workertoCSV = new bulkupload();
  let columnHeaders = null;
  describe('get headers', () => {
    it('should return a string of headers seperated by a comma', () => {
      columnHeaders = workertoCSV.headers(maxquals);
      expect(typeof columnHeaders).to.equal('string');
    });
    it('should split on commas to create an array of headers', () => {
      columnHeaders = columnHeaders.split(',');
      expect(Array.isArray(columnHeaders)).to.equal(true);
    });
    it('should be the same length of known headers', () => {
      expect(columnHeaders.length).to.equal(knownHeaders.length);
    });
    it('should return the list of known headers', () => {
      columnHeaders.forEach((name, index) => {
        expect(name).to.equal(knownHeaders[index]);
      });
    });
  });
  workers.forEach((worker, index) => {
    describe('toCSV(establishmentId, entity, MAX_QUALIFICATIONS) with worker ' + index, () => {
      let workerCSV = null;
      it('should return a string of values for the worker seperated by a comma', () => {
        workerCSV = workertoCSV.toCSV(establishmentId, worker, maxquals);
        expect(typeof workerCSV).to.equal('string');
      });
      it('should split on commas to create an array of values', () => {
        workerCSV = workerCSV.split(',');
        expect(Array.isArray(workerCSV)).to.equal(true);
      });
      it('should be the same length of known headers', () => {
        expect(workerCSV.length).to.equal(knownHeaders.length);
      });
      it('should match the header values', () => {
        let otherJobs = '';
        let otherJobsDesc = '';
        let scqual = '';
        let nonscqual = '';
        const mappedCsv = mapCsvToWorker(workerCSV, columnHeaders);
        console.log(mappedCsv);
        if (Array.isArray(worker.otherJobs.otherJobs)) {
          worker.otherJobs.otherJobs.forEach((job, index) => {
            otherJobs += job.budi;
            if (job.other){
              otherJobsDesc += job.other;
            }
            index < (worker.otherJobs.otherJobs.length - 1) ? otherJobs += ';' : otherJobs += '';
            index < (worker.otherJobs.otherJobs.length - 1) ? otherJobsDesc += ';' : otherJobsDesc += '';
          });
        } else {
          expect(establishment.otherServices).to.equal(null);
          expect(worker.otherJobs.otherJobs).to.equal(null);
        }
        if (worker.socialCareQualification) {
          scqual += worker.socialCareQualificationId;
        }
        if (worker.socialCareQualificationLevel) {
          scqual += ";";
          scqual += worker.socialCareQualificationLevel.budi;
        }
        if (worker.nonSocialCareQualification) {
          nonscqual += worker.nonSocialCareQualificationId;
        }
        if (worker.nonSocialCareQualificationLevel) {
          nonscqual += ";";
          nonscqual += worker.nonSocialCareQualificationLevel.budi;
        }
        expect(mappedCsv.LOCALESTID).to.equal(establishmentId);
        expect(mappedCsv.UNIQUEWORKERID).to.equal(workertoCSV._csvQuote(worker.localIdentifier));
        expect(mappedCsv.STATUS).to.equal('UNCHECKED');
        expect(mappedCsv.DISPLAYID).to.equal(workertoCSV._csvQuote(worker.nameOrId));
        if (worker.nationalInsuranceNumber) {
          expect(mappedCsv.NINUMBER).to.equal(worker.nationalInsuranceNumber.replace(/\s+/g, ''));
        } else {
          expect(mappedCsv.NINUMBER).to.equal('');
        }
        if (worker.postcode) {
          expect(mappedCsv.POSTCODE).to.equal(worker.postcode);
        } else {
          expect(mappedCsv.POSTCODE).to.equal('');
        }
        if (worker.dateOfBirth) {
          const dobParts = worker.dateOfBirth.split('-');
          expect(mappedCsv.DOB).to.equal(`${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`);
        } else {
          expect(mappedCsv.DOB).to.equal('');
        }
        if (worker.gender) {
          expect(parseInt(mappedCsv.GENDER)).to.equal(worker.genderId);
        } else {
          expect(mappedCsv.GENDER).to.equal('');
        }
        if (worker.ethnicity) {
          expect(parseInt(mappedCsv.ETHNICITY)).to.equal(worker.ethnicity.budi);
        } else {
          expect(mappedCsv.ETHNICITY).to.equal('');
        }
        // Needs sandbox
        if (worker.nationality) {
          expect(parseInt(mappedCsv.NATIONALITY)).to.equal(workertoCSV._maptoCSVnationality(worker.nationality));
        } else {
          expect(mappedCsv.NATIONALITY).to.equal('');
        }
        if (worker.britishCitizenship) {
          expect(parseInt(mappedCsv.BRITISHCITIZENSHIP)).to.equal(worker.britishCitizenshipId);
        } else {
          expect(mappedCsv.BRITISHCITIZENSHIP).to.equal('');
        }
        // Needs sandbox
        if (worker.countryOfBirth) {
          expect(parseInt(mappedCsv.COUNTRYOFBIRTH)).to.equal(workertoCSV._maptoCSVcountry(worker.countryOfBirth));
        } else {
          expect(mappedCsv.COUNTRYOFBIRTH).to.equal('');
        }
        if (worker.disabiliity) {
          expect(parseInt(mappedCsv.DISABLED)).to.equal(worker.disabiliityId);
        } else {
          expect(mappedCsv.DISABLED).to.equal('');
        }
        if (worker.careCerticate) {
          expect(parseInt(mappedCsv.CARECERT)).to.equal(worker.careCerticateId);
        } else {
          expect(mappedCsv.CARECERT).to.equal('');
        }
        // Needs sandbox
        if (worker.recruitmentSource) {
          expect(parseInt(mappedCsv.RECSOURCE)).to.equal(worker.recruitmentSource.budi);
        } else {
          expect(mappedCsv.CARECERT).to.equal('');
        }
        if (worker.mainJobStartDate) {
          const mainJobStartDateParts = worker.mainJobStartDate.split('-');
          expect(mappedCsv.STARTDATE).to.equal(`${mainJobStartDateParts[2]}/${mainJobStartDateParts[1]}/${mainJobStartDateParts[0]}`);
        } else {
          expect(mappedCsv.STARTDATE).to.equal('');
        }
        if (worker.socialCareStartDate) {
          expect(parseInt(mappedCsv.STARTINSECT)).to.equal(workertoCSV._maptoCSVStartedInSector(worker.socialCareStartDate));
        } else {
          expect(mappedCsv.STARTINSECT).to.equal('');
        }
        if (worker.apprenticeship) {
          expect(parseInt(mappedCsv.APPRENTICE)).to.equal(worker.apprenticeshipId);
        } else {
          expect(mappedCsv.APPRENTICE).to.equal(999);
        }
        if (worker.contract) {
          expect(parseInt(mappedCsv.EMPLSTATUS)).to.equal(worker.contractId);
        } else {
          expect(mappedCsv.EMPLSTATUS).to.equal('');
        }
        if (worker.zeroContractHours) {
          expect(parseInt(mappedCsv.ZEROHRCONT)).to.equal(worker.zeroContractHoursId);
        } else {
          expect(mappedCsv.ZEROHRCONT).to.equal('');
        }
        // Needs sandbox
        if (worker.daysSick) {
          expect(parseInt(mappedCsv.DAYSSICK)).to.equal(workertoCSV._maptoCSVDaysSick(worker.daysSick));
        } else {
          expect(mappedCsv.DAYSSICK).to.equal('');
        }
        if (worker.annualHourlyPay) {
          const salaryMap = workertoCSV._maptoCSVslary(worker.annualHourlyPay);
          expect(mappedCsv.SALARYINT).to.equal(String(salaryMap[0]));
          expect(mappedCsv.SALARY).to.equal(String(salaryMap[1]));
          expect(mappedCsv.HOURLYRATE).to.equal(String(salaryMap[2]));
        } else {
          expect(mappedCsv.SALARYINT).to.equal('');
          expect(mappedCsv.SALARY).to.equal('');
          expect(mappedCsv.HOURLYRATE).to.equal('');
        }
        if (worker.mainJob) {
          expect(parseInt(mappedCsv.MAINJOBROLE)).to.equal(worker.mainJob.budi);
        } else {
          expect(mappedCsv.MAINJOBROLE).to.equal('');
        }
        // Needs sandbox
        if (worker.mainJob) {
          expect(parseInt(mappedCsv.MAINJOBROLE)).to.equal(worker.mainJob.budi);
        } else {
          expect(mappedCsv.MAINJOBROLE).to.equal('');
        }
        if (worker.mainJob.other) {
          expect(mappedCsv.MAINJRDESC).to.equal(worker.mainJob.other);
        } else {
          expect(mappedCsv.MAINJRDESC).to.equal('');
        }
        if (worker.contract && ['Permanent', 'Temporary'].includes(worker.contract) && worker.zeroContractHours !== 'Yes' && worker.contractedHours) {
          expect(mappedCsv.CONTHOURS).to.equal(worker.contractedHours.hours);
        } else {
          expect(mappedCsv.CONTHOURS).to.equal('');
        }
        if (((worker.contract && ['Pool/Bank', 'Agency', 'Other'].includes(worker.contract)) || worker.zeroContractHours === 'Yes') && worker.averageHours) {
            expect(parseInt(mappedCsv.AVGHOURS)).to.equal(worker.averageHours.hours);
        } else {
          expect(mappedCsv.AVGHOURS).to.equal('');
        }
        expect(mappedCsv.OTHERJOBROLE).to.equal(otherJobs);
        expect(mappedCsv.OTHERJRDESC).to.equal(otherJobsDesc);
        if (worker.registeredNurse) {
          expect(mappedCsv.NMCREG).to.equal(worker.registeredNurseId);
        } else {
          expect(mappedCsv.NMCREG).to.equal('');
        }
        // Needs sandbox
        if (worker.nurseSpecialism) {
          expect(parseInt(mappedCsv.NURSESPEC)).to.equal(worker.nurseSpecialism.id);
        } else {
          expect(mappedCsv.NURSESPEC).to.equal('');
        }
        if (worker.approvedMentalHealthWorker) {
          expect(parseInt(mappedCsv.AMHP)).to.equal(worker.approvedMentalHealthWorkerId);
        } else {
          expect(mappedCsv.AMHP).to.equal('');
        }
        if (worker.socialCareQualification) {
          expect(mappedCsv.SCQUAL).to.equal(scqual);
        } else {
          expect(mappedCsv.SCQUAL).to.equal('');
        }
        if (worker.nonSocialCareQualification) {
          expect(mappedCsv.NONSCQUAL).to.equal(nonscqual);
        } else {
          expect(mappedCsv.NONSCQUAL).to.equal('');
        }
        for (var i = 0; i < maxquals; i++) {
          if (worker.qualifications[i]) {
            const year = worker.qualifications[i].year ? worker.qualifications[i].year : '';
            expect(mappedCsv['QUALACH0' + (i + 1)]).to.equal(worker.qualifications[i].qualification.budi + ";" + year);
            if (worker.qualifications[i].notes) {
              expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal(worker.qualifications[i].notes);
            } else {
              expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal('');
            }
          } else {
            expect(mappedCsv['QUALACH0' + (i + 1)]).to.equal('');
            expect(mappedCsv['QUALACH0' + (i + 1) + 'NOTES']).to.equal('');
          }
        }
      });
    });
  });
});

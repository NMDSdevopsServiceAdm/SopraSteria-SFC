const expect = require('chai').expect;
const bulkupload = require('../../../../../models/BulkImport/csv/establishments').Establishment;
const establishments = require('../../../mockdata/establishment').data;
const knownHeaders = require('../../../mockdata/establishment').knownHeaders;

function mapCsvToEstablishment(establishment, headers) {
  const mapped = {};
  headers.forEach((header, index) => {
    mapped[header] = establishment[index];
  });
  return mapped;
}

describe('/server/models/Bulkimport/csv/establishment.js', () => {
  const establishmenttoCSV = new bulkupload();
  let columnHeaders = null;
  describe('get headers', () => {
    it('should return a string of headers seperated by a comma', () => {
      columnHeaders = establishmenttoCSV.headers;
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
  establishments.forEach((establishment, index) => {
    describe('toCSV(entity) with establishment ' + index, () => {
      let establishmentCSV = null;
      it('should return a string of values for the establishment seperated by a comma', () => {
        establishmentCSV = establishmenttoCSV.toCSV(establishment);
        expect(typeof establishmentCSV).to.equal('string');
      });
      it('should split on commas to create an array of values', () => {
        establishmentCSV = establishmentCSV.split(',');
        expect(Array.isArray(establishmentCSV)).to.equal(true);
      });
      it('should be the same length of known headers', () => {
        expect(establishmentCSV.length).to.equal(knownHeaders.length);
      });
      it('should match the header values', () => {
        let otherservices = '';
        let localauthorities = '';
        let capacities = '';
        let serviceDesc = '';
        let serviceUsers = '';
        let otherServiceUsers = '';
        let jobs = [];
        let alljobs = '';
        let allStarters = '';
        let allLeavers = '';
        let allVacancies = '';
        let reasons = '';
        let reasonCount = '';
        if (establishment.otherServices) {
          establishment.otherServices.forEach((service, index) => {
            otherservices += service.budi;
            index < (establishment.otherServices.length - 1) ? otherservices += ';' : otherservices += '';
          });
        }
        if (establishment.shareWithLA) {
          establishment.shareWithLA.forEach((la, index) => {
            localauthorities += la.cssrId;
            index < (establishment.shareWithLA.length - 1) ? localauthorities += ';' : localauthorities += '';
          });
        }
        if (establishment.capacities) {
          establishment.capacities.forEach((capacity, index) => {
            if (capacity.reference.other) {
              serviceDesc += capacity.reference.other;
            }
            if (index < (establishment.capacities.length - 1)) {
              capacities += ';';
              serviceDesc += ';';
            } else {
              capacities += '';
              serviceDesc += '';
            }
          });
        }
        if (establishment.serviceUsers) {
          establishment.serviceUsers.forEach((sUser, index) => {
            if (sUser.other) {
              otherServiceUsers += sUser.other;
            }
            serviceUsers += sUser.budi;
            if (index < (establishment.serviceUsers.length - 1)) {
              serviceUsers += ';';
              otherServiceUsers += ';';
            } else {
              serviceUsers += '';
              otherServiceUsers += '';
            }
          });
        }
        if (establishment.starters) {
          establishment.starters.forEach(job => {
            if(!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        }
        if (establishment.leavers) {
          establishment.leavers.forEach(job => {
            if(!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        }
        if (establishment.vacancies) {
          establishment.vacancies.forEach(job => {
            if(!jobs.includes(job.budi)) {
              jobs.push(job.budi);
            }
          });
        }
        jobs.forEach((job, index) => {
          alljobs += job;
          let starterFound = false;
          establishment.starters.forEach(starters => {
            if (job === starters.budi) starterFound = true;
          });
          starterFound ? allStarters += '' : allStarters += '0';
          let leaverFound = false;
          establishment.leavers.forEach(leavers => {
            if (job === leavers.budi) leaverFound = true;
          });
          leaverFound ? allLeavers += '' : allLeavers += '0';
          let vacancyFound = false;
          establishment.vacancies.forEach(vacancies => {
            if(job === vacancies.budi) vacancyFound = true;
          });
          vacancyFound ? allVacancies += '' : allVacancies += '0';
          if(index < (jobs.length - 1)) {
            alljobs += ';';
            allStarters += ';';
            allLeavers += ';';
            allVacancies += ';';
          } else {
            alljobs += '';
            allStarters += '';
            allLeavers += '';
            allVacancies += '';
          }
        });
        if (establishment.reasonsForLeaving) {
          const reasonsForLeaving = establishment.reasonsForLeaving.split('|');
          reasonsForLeaving.forEach((reason, index) => {
            let reasonarray = reason.split(':');
            reasons += reasonarray[0];
            reasonCount += reasonarray[1];
            if(index < (reasonsForLeaving.length - 1)) {
              reasons += ';';
              reasonCount += ';';
            } else {
              reasons += '';
              reasonCount += '';
            }
          });
        }
        const mappedCsv = mapCsvToEstablishment(establishmentCSV, columnHeaders);
        expect(mappedCsv.LOCALESTID).to.equal(establishment.localIdentifier);
        expect(mappedCsv.STATUS).to.equal('UNCHECKED');
        expect(mappedCsv.ESTNAME).to.equal(establishment.name);
        expect(mappedCsv.ADDRESS1).to.equal(establishment.address1);
        expect(mappedCsv.ADDRESS2).to.equal(establishment.address2);
        expect(mappedCsv.ADDRESS3).to.equal(establishment.address3);
        expect(mappedCsv.POSTTOWN).to.equal(establishment.town);
        expect(mappedCsv.POSTCODE).to.equal(establishment.postcode);
        if (establishment.employerType.id) {
          expect(parseInt(mappedCsv.ESTTYPE)).to.equal(establishment.employerType.id);
          expect(mappedCsv.OTHERTYPE).to.equal('');
        } else {
          expect(mappedCsv.OTHERTYPE).to.equal('');
        }
        expect(mappedCsv.PERMCQC).to.equal(establishment.shareWith.enabled && establishment.shareWith.with.indexOf('CQC') > -1 ? '1' : '');
        expect(mappedCsv.PERMLA).to.equal(establishment.shareWith.enabled && establishment.shareWith.with.indexOf('Local Authority') > -1 ? '1' : '');
        expect(mappedCsv.SHARELA).to.equal(localauthorities);
        expect(mappedCsv.REGTYPE).to.equal(establishment.isRegulated ? '2' : '0');
        expect(mappedCsv.PROVNUM).to.equal(establishment.provId);
        expect(mappedCsv.LOCATIONID).to.equal(establishment.locationId);
        expect(parseInt(mappedCsv.MAINSERVICE)).to.equal(establishment.mainService.budi);
        expect(mappedCsv.ALLSERVICES).to.equal(otherservices);
        expect(mappedCsv.CAPACITY).to.equal(capacities);
        expect(mappedCsv.UTILISATION).to.equal(capacities);
        expect(mappedCsv.SERVICEDESC).to.equal(serviceDesc);
        expect(mappedCsv.SERVICEUSERS).to.equal(serviceUsers);
        expect(mappedCsv.OTHERUSERDESC).to.equal(otherServiceUsers);
        expect(parseInt(mappedCsv.TOTALPERMTEMP)).to.equal(establishment.numberOfStaff);
        expect(mappedCsv.ALLJOBROLES).to.equal(alljobs);
        expect(mappedCsv.STARTERS).to.equal(allStarters);
        expect(mappedCsv.LEAVERS).to.equal(allLeavers);
        expect(mappedCsv.VACANCIES).to.equal(allVacancies);
        expect(mappedCsv.REASONS).to.equal(reasons);
        expect(mappedCsv.REASONNOS).to.equal(reasonCount);
      });
    });
  });
});

const expect = require('chai').expect;
const {
  restoreNINumber,
  restoreDOB,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkerCsv');

describe('validateWorkerCsv', () => {
  const existingWorker = {
    nationalInsuranceNumber: { currentValue: 'AB7070707' },
    dateOfBirth: { currentValue: '1998-02-01' },
  };

  describe('restoreNINumber', () => {
    it('should return the NI number if the NI number is passed', () => {
      expect(restoreNINumber('AB7070707', existingWorker)).to.equal('AB7070707');
    });

    it('should return the NI number if Admin is passed in place of the NI number', () => {
      expect(restoreNINumber('Admin', existingWorker)).to.equal('AB7070707');
    });

    it('should return the NI number as an empty string if no NI number is passed in', () => {
      expect(restoreNINumber('', existingWorker)).to.equal('');
    });

    it('should return the NI number as an empty string if admin is passed in but there is no existing worker', () => {
      expect(restoreNINumber('Admin', null)).to.equal('');
    });
  });

  describe('restoreDOB', () => {
    it('should return the date of birth if the date of birth is passed', () => {
      expect(restoreDOB('01/02/1998', existingWorker)).to.equal('01/02/1998');
    });

    it('should return the formatted date of birth if Admin is passed in place of the date of birth', () => {
      expect(restoreDOB('Admin', existingWorker)).to.equal('01/02/1998');
    });

    it('should return the date of birth as an empty string if no date of birth is passed in', () => {
      expect(restoreDOB('', existingWorker)).to.equal('');
    });

    it('should return the date of birth as an empty string if admin is passed in but there is no existing worker', () => {
      expect(restoreDOB('Admin', null)).to.equal('');
    });
  });
});

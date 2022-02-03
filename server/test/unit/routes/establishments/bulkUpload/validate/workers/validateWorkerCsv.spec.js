const expect = require('chai').expect;
const {
  restoreNINumber,
  restoreDOB,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/workers/validateWorkerCsv');

describe('validateWorkerCsv', () => {
  describe('restoreNINumber', () => {
    let existingWorkerNINumber = 'AB7070707';

    it('should return the NI number if the NI number is passed', () => {
      expect(restoreNINumber('AB7070707', existingWorkerNINumber)).to.equal('AB7070707');
    });

    it('should return the NI number if Admin is passed in place of the NI number', () => {
      expect(restoreNINumber('Admin', existingWorkerNINumber)).to.equal('AB7070707');
    });

    it('should return and empty string if no NI number is passed in', () => {
      expect(restoreNINumber('', existingWorkerNINumber)).to.equal('');
    });
  });

  describe('restoreDOB', () => {
    let existingWorkerDOB = '1998-02-01';

    it('should return the date of birth if the date of birth is passed', () => {
      expect(restoreDOB('01/02/1998', existingWorkerDOB)).to.equal('01/02/1998');
    });

    it('should return the formatted date of birth if Admin is passed in place of the date of birth', () => {
      expect(restoreDOB('Admin', existingWorkerDOB)).to.equal('01/02/1998');
    });

    it('should return and empty string if no NI number is passed in', () => {
      expect(restoreDOB('', existingWorkerDOB)).to.equal('');
    });
  });
});

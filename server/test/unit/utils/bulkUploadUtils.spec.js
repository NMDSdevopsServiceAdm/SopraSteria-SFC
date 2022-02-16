const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models');

const {
  createWorkerKey,
  deleteRecord,
  csvQuote,
  createEstablishmentKey,
  dateFormatter,
  hideNinoAndDob,
  showNinoAndDob,
  staffData,
} = require('../../../utils/bulkUploadUtils');

describe('bulkUploadUtils', () => {
  describe('dateFormatter', () => {
    it('should return the date correctly formatted when a date is passed', () => {
      expect(dateFormatter('1998-02-03')).to.equal('03/02/1998');
    });
    it('should return am empty string if no date is given', () => {
      expect(dateFormatter(null)).to.equal('');
    });
    it('should return an empty string if an empty string is given', () => {
      expect(dateFormatter('')).to.equal('');
    });
  });

  describe('createWorkerKey', () => {
    it('should return key with localId and uniqueWorkerId concatenated', async () => {
      const worker = { localId: 'mockWorkplace', uniqueWorkerId: 'testUser' };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('mockWorkplacetestUser');
    });

    it('should return key with localId and uniqueWorkerId concatenated with whitespace removed', async () => {
      const worker = { localId: 'Workplace With Spaces', uniqueWorkerId: 'Test User' };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('WorkplaceWithSpacesTestUser');
    });

    it('should return key with just localId (with whitespace removed) if uniqueWorkerId is null', async () => {
      const worker = { localId: 'Workplace With Spaces', uniqueWorkerId: null };

      const workerKey = createWorkerKey(worker.localId, worker.uniqueWorkerId);

      expect(workerKey).to.equal('WorkplaceWithSpaces');
    });
  });

  describe('createEstablishmentKey', () => {
    it('should return empty string if null passed in', async () => {
      const establishmentKey = createEstablishmentKey(null);

      expect(establishmentKey).to.equal('');
    });

    it('should return string establishmentId as is if no spaces', async () => {
      const establishmentKey = createEstablishmentKey('Workplace');

      expect(establishmentKey).to.equal('Workplace');
    });

    it('should return establishmentId with whitespace removed', async () => {
      const establishmentKey = createEstablishmentKey('Workplace With Spaces');

      expect(establishmentKey).to.equal('WorkplaceWithSpaces');
    });
  });

  describe('deleteRecord', () => {
    it('should remove worker key/value from myAPIWorkers', async () => {
      const myAPIWorkers = {
        2: {},
        3: {},
      };

      const workerLineNumber = 3;

      deleteRecord(myAPIWorkers, workerLineNumber);

      expect(!myAPIWorkers[workerLineNumber]).to.equal(true);
    });
  });

  describe('csvQuote()', () => {
    it('should add quotes around string with a , ', () => {
      expect(csvQuote('Hello, ')).to.equal('"Hello, "');
    });

    it('should not add quotes around string with out a , ', () => {
      expect(csvQuote('Hello')).to.equal('Hello');
    });
  });

  describe('hideNinoAndDob', () => {
    const niNoIndex = 3;
    const dobIndex = 5;

    it('should return the data with the nino and dob set to admin, when they are present in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', 'AB123456B', 'AB1 2CD', '01/02/1990'];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', 'Admin', 'AB1 2CD', 'Admin'];

      expect(hideNinoAndDob(dataArr, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data with the nino and dob set to admin, when they are admin in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', 'Admin', 'AB1 2CD', 'Admin'];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', 'Admin', 'AB1 2CD', 'Admin'];

      expect(hideNinoAndDob(dataArr, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data with the nino and dob blank, when they are not in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', ''];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', ''];

      expect(hideNinoAndDob(dataArr, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data with the nino set to admin and dob blank, when the nino is the data but the dob is not', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', 'AB123456B', 'AB1 2CD', ''];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', 'Admin', 'AB1 2CD', ''];

      expect(hideNinoAndDob(dataArr, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });
  });

  describe('showNinoAndDob', () => {
    const niNoIndex = 3;
    const dobIndex = 5;
    const worker = { NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' };

    it('should return the data showing the nino and dob, when they are Admin in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', 'Admin', 'AB1 2CD', 'Admin'];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', 'AB123456B', 'AB1 2CD', '01/02/1990'];

      expect(showNinoAndDob(dataArr, worker, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data showing the nino and dob, when they are in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', 'AB123456B', 'AB1 2CD', '01/02/1990'];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', 'AB123456B', 'AB1 2CD', '01/02/1990'];

      expect(showNinoAndDob(dataArr, worker, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data with the nino and dob blank, when they are not in the data', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', ''];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', ''];

      expect(showNinoAndDob(dataArr, worker, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });

    it('should return the data with the nino set to admin and dob blank, when the nino is the data but the dob is not', () => {
      const dataArr = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', 'Admin'];
      const expectedResult = ['human', 'Nurse Jones', 'UPDATE', '', 'AB1 2CD', '01/02/1990'];

      expect(showNinoAndDob(dataArr, worker, niNoIndex, dobIndex)).to.deep.equal(expectedResult);
    });
  });

  describe('staffData', () => {
    beforeEach(() => {
      sinon
        .stub(models.worker, 'findOne')
        .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return the data correctly formatted for a download type of StaffSanitise', async () => {
      const downloadType = 'StaffSanitise';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should return the data correctly formatted for a download type of StaffSanitise when Admin in the data', async () => {
      const downloadType = 'StaffSanitise';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should return the data correctly formatted for a download type of StaffSanitise when nino and dob are not in the data', async () => {
      const downloadType = 'StaffSanitise';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should return the data correctly formatted for a download type of Staff', async () => {
      const downloadType = 'Staff';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should return the data correctly formatted for a download type of Staff when nino and dob in the data', async () => {
      const downloadType = 'Staff';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should return the data correctly formatted for a download type of Staff when nino and dob are not in the data', async () => {
      const downloadType = 'Staff';

      const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

      const expectedResult = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

      const result = await staffData(data, downloadType);

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

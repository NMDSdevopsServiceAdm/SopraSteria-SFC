const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../models');

const {
  uploadedStarGet,
  staffData,
  showNinoAndDob,
  hideNinoAndDob,
} = require('../../../../../routes/establishments/bulkUpload/uploaded');

describe('/server/routes/establishment/uploaded.js', () => {
  afterEach(() => {
    sinon.restore();
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

  describe('uploadedStarGet', () => {});
});

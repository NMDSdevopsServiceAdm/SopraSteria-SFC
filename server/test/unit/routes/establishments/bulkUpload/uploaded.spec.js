const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../models');
const S3 = require('../../../../../routes/establishments/bulkUpload/s3');

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

  describe.only('uploadedStarGet', () => {
    beforeEach(() => {
      sinon
        .stub(models.worker, 'findOne')
        .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });
    });

    describe('downloadType = StaffSanitise', () => {
      it('returns sanitised staff file when dob and nino are in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });

      it('returns sanitised staff file when dob and nino values are Admin in the data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });

      it('returns sanitised staff file when dob and nino are not in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });
    });

    describe('downloadType = Staff', () => {
      it('returns staff file when dob and nino are in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });

      it('returns staff file when dob and nino values are Admin in the data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });

      it('returns sanitised staff file when dob and nino are not in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-staff.csv',
          },
        ]);
      });
    });

    describe.only('downloadType = Workplace', () => {
      it('returns establishment file', async () => {
        const data = `LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,\r\n
        human,UPDATE,Care Home 1,31 Some Street,,,Leeds,LS1 2AD,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-workplace.csv'],
            query: { downloadType: 'Workplace' },
          },
          {},
        );
        const updatedData = `LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,\r\n
        human,UPDATE,Care Home 1,31 Some Street,,,Leeds,LS1 2AD,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-workplace.csv'],
            query: { downloadType: 'Workplace' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-workplace.csv',
          },
        ]);
      });
    });

    describe('downloadType = Training', () => {
      it('returns training file', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DATECOMPLETED,EXPIRYDATE,ACCREDITED,NOTES,\r\n
        human,Nurse Jones,31,Test,01/01/2020,01/01/2023,0,,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-training.csv'],
            query: { downloadType: 'Training' },
          },
          {},
        );
        const updatedData = `LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DATECOMPLETED,EXPIRYDATE,ACCREDITED,NOTES,\r\n
        human,Nurse Jones,31,Test,01/01/2020,01/01/2023,0,,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-training.csv'],
            query: { downloadType: 'Training' },
          },
          {},
          200,
          updatedData,
          {
            'Content-Type': 'text/csv',
            'Content-disposition': 'attachment; filename=2022-01-01-sfc-bu-training.csv',
          },
        ]);
      });
    });
  });
});

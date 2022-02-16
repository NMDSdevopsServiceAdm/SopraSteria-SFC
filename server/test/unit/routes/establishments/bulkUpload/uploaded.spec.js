const expect = require('chai').expect;
const sinon = require('sinon');
const S3 = require('../../../../../routes/establishments/bulkUpload/s3');
// const buUtils = require('../../../../../utils/bulkUploadUtils');
const { uploadedStarGet } = require('../../../../../routes/establishments/bulkUpload/uploaded');
const models = require('../../../../../models');

describe('/server/routes/establishment/uploaded.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('uploadedStarGet', () => {
    describe('downloadType = StaffSanitise', () => {
      it('returns sanitised staff file when dob and nino are in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(S3, 'downloadContent').returns({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });
        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

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

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

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

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'StaffSanitise' },
          },
          {},
        );

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

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

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

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

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

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        // sinon.stub(buUtils, 'staffData').returns(updatedData);
        sinon
          .stub(models.worker, 'findOne')
          .returns({ NationalInsuranceNumberValue: 'AB123456B', DateOfBirthValue: '01/02/1990' });

        const saveResponse = sinon.stub(S3, 'saveResponse');

        await uploadedStarGet(
          {
            params: ['1/lastBulkUpload/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

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

    describe('downloadType = Workplace', () => {
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

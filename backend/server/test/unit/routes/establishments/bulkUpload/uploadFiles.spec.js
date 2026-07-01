'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const BulkUploadS3Utils = require('../../../../../routes/establishments/bulkUpload/s3');
const s3ClientV3 = require('../../../../../routes/establishments/bulkUpload/s3clientv3');
const buUtils = require('../../../../../utils/bulkUploadUtils');
const uploadedFiles = require('../../../../../routes/establishments/bulkUpload/uploadFiles');
const { trainingHeadersAsArray } = require('../../../mockdata/training');
const { knownHeaders } = require('../../../mockdata/establishment');
const s3clientv3 = require('../../../../../routes/establishments/bulkUpload/s3clientv3');
const { buildGetObjectResponseBody } = require('./testUtils');

const trainingHeaders = trainingHeadersAsArray.join(',');
const newLine = '\r\n';

describe('/server/routes/establishment/uploadFiles.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('uploadedPut', () => {
    const TrainingFile = trainingHeaders;
    const EstablishmentFile = knownHeaders.join(',');
    const WorkerFile =
      'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,NINUMBER,POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,DISABLED,CARECERT,L2CARECERT,RECSOURCE,HANDCVISA,INOUTUK,STARTDATE,STARTINSECT,DHA,APPRENTICE,EMPLSTATUS,ZEROHRCONT,DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,CWPCATEGORY,QUALACH01,QUALACH01NOTES,QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';
    const OtherFile = 'Test,This,is,NOT,A,BULK,UPLOAD,FILE';

    it('Identifies establishment files', async () => {
      sinon.stub(s3ClientV3, 'listObjects').resolves({
        IsTruncated: false,
        Marker: '',
        Contents: [
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-establishments.csv',
            LastModified: '2021-01-27T08:34:53.000Z',
            Size: 294,
          },
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-establishments.csv.metadata.json',
            LastModified: '2021-01-26T14:28:35.000Z',
            Size: 181,
          },
        ],
        Name: 'sfcbulkuploadfiles',
        Prefix: '2351/latest/',
      });
      const body = buildGetObjectResponseBody(EstablishmentFile);
      sinon.stub(s3ClientV3, 'getObject').resolves({
        AcceptRanges: 'bytes',
        Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
        LastModified: '2021-01-26T14:28:35.000Z',
        ContentLength: 171,
        ETag: '""',
        VersionId: 'null',
        ContentType: 'application/json',
        Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
        Body: body,
      });

      const returnData = [
        {
          filename: '2021-01-26-sfc-bulk-upload-establishments.csv',
          uploaded: '2021-01-27T08:34:53.000Z',
          username: 'george-benchmarking',
          records: 0,
          errors: 0,
          warnings: 0,
          fileType: 'Establishment',
          size: 294,
          key: '2351/latest/2021-01-26-sfc-bulk-upload-establishments.csv',
        },
      ];

      const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

      await uploadedFiles.uploadedPut(
        {
          establishmentId: '2000',
          username: 'test123',
        },
        {},
      );
      expect(saveResponse.getCalls()[0].args).to.deep.equal([
        { establishmentId: '2000', username: 'test123' },
        {},
        200,
        returnData,
      ]);
    });

    it('Identifies Training files', async () => {
      sinon.stub(s3clientv3, 'listObjects').resolves({
        IsTruncated: false,
        Marker: '',
        Contents: [
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-training.csv',
            LastModified: '2021-01-27T08:34:53.000Z',
            Size: 294,
          },
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-training.csv.metadata.json',
            LastModified: '2021-01-26T14:28:35.000Z',
            Size: 181,
          },
        ],
        Name: 'sfcbulkuploadfiles',
        Prefix: '2351/latest/',
      });

      const body = buildGetObjectResponseBody(TrainingFile);
      sinon.stub(s3ClientV3, 'getObject').resolves({
        AcceptRanges: 'bytes',
        Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
        LastModified: '2021-01-26T14:28:35.000Z',
        ContentLength: 171,
        ETag: '""',
        VersionId: 'null',
        ContentType: 'application/json',
        Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
        Body: body,
      });

      const returnData = [
        {
          filename: '2021-01-26-sfc-bulk-upload-training.csv',
          uploaded: '2021-01-27T08:34:53.000Z',
          username: 'george-benchmarking',
          records: 0,
          errors: 0,
          warnings: 0,
          fileType: 'Training',
          size: 294,
          key: '2351/latest/2021-01-26-sfc-bulk-upload-training.csv',
        },
      ];

      const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

      await uploadedFiles.uploadedPut(
        {
          establishmentId: '2000',
          username: 'test123',
        },
        {},
      );
      expect(saveResponse.getCalls()[0].args).to.deep.equal([
        { establishmentId: '2000', username: 'test123' },
        {},
        200,
        returnData,
      ]);
    });

    it('Identifies Worker files', async () => {
      sinon.stub(s3ClientV3, 'listObjects').resolves({
        IsTruncated: false,
        Marker: '',
        Contents: [
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-worker.csv',
            LastModified: '2021-01-27T08:34:53.000Z',
            Size: 294,
          },
          {
            Key: '2351/latest/2021-01-26-sfc-bulk-upload-worker.csv.metadata.json',
            LastModified: '2021-01-26T14:28:35.000Z',
            Size: 181,
          },
        ],
        Name: 'sfcbulkuploadfiles',
        Prefix: '2351/latest/',
      });
      const body = buildGetObjectResponseBody(WorkerFile);
      sinon.stub(s3ClientV3, 'getObject').resolves({
        AcceptRanges: 'bytes',
        Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
        LastModified: '2021-01-26T14:28:35.000Z',
        ContentLength: 171,
        ETag: '""',
        VersionId: 'null',
        ContentType: 'application/json',
        Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
        Body: body,
      });

      const returnData = [
        {
          filename: '2021-01-26-sfc-bulk-upload-worker.csv',
          uploaded: '2021-01-27T08:34:53.000Z',
          username: 'george-benchmarking',
          records: 0,
          errors: 0,
          warnings: 0,
          fileType: 'Worker',
          size: 294,
          key: '2351/latest/2021-01-26-sfc-bulk-upload-worker.csv',
        },
      ];

      const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

      await uploadedFiles.uploadedPut(
        {
          establishmentId: '2000',
          username: 'test123',
        },
        {},
      );

      expect(saveResponse.getCalls()[0].args).to.deep.equal([
        { establishmentId: '2000', username: 'test123' },
        {},
        200,
        returnData,
      ]);
    });

    it('Identifies None Bulk Upload CSV files', async () => {
      sinon.stub(s3ClientV3, 'listObjects').resolves({
        IsTruncated: false,
        Marker: '',
        Contents: [
          {
            Key: '2351/latest/2021-01-26-MyTaxes.csv',
            LastModified: '2021-01-27T08:34:53.000Z',
            Size: 294,
          },
        ],
        Name: 'sfcbulkuploadfiles',
        Prefix: '2351/latest/',
      });

      const body = buildGetObjectResponseBody(OtherFile);
      sinon.stub(s3ClientV3, 'getObject').resolves({
        AcceptRanges: 'bytes',
        Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
        LastModified: '2021-01-26T14:28:35.000Z',
        ContentLength: 171,
        ETag: '""',
        VersionId: 'null',
        ContentType: 'application/json',
        Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
        Body: body,
      });

      const returnData = [
        {
          filename: '2021-01-26-MyTaxes.csv',
          uploaded: '2021-01-27T08:34:53.000Z',
          username: 'george-benchmarking',
          records: null,
          errors: 0,
          warnings: 0,
          fileType: null,
          size: 294,
          key: '2351/latest/2021-01-26-MyTaxes.csv',
        },
      ];

      const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

      await uploadedFiles.uploadedPut(
        {
          establishmentId: '2000',
          username: 'test123',
        },
        {},
      );
      expect(saveResponse.getCalls()[0].args).to.deep.equal([
        { establishmentId: '2000', username: 'test123' },
        {},
        200,
        returnData,
      ]);
    });
  });

  describe('uploadedStarGet', () => {
    describe('downloadType = StaffSanitise', () => {
      it('returns sanitised staff file when dob and nino are in data', async () => {
        const data = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(BulkUploadS3Utils, 'downloadContent').resolves({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').resolves({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,Admin,AB1 2CD,Admin,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').resolves({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').returns({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').returns({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,AB123456B,AB1 2CD,01/02/1990,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').returns({ data });

        const updatedData = `LOCALESTID,UNIQUEWORKERID,STATUS,NINUMBER,POSTCODE,DOB\r\n
        human,Nurse Jones,UPDATE,,AB1 2CD,,`;

        sinon.stub(buUtils, 'staffData').returns(updatedData);

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
            query: { downloadType: 'Staff' },
          },
          {},
        );

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-staff.csv'],
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

        sinon.stub(BulkUploadS3Utils, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-workplace.csv'],
            query: { downloadType: 'Workplace' },
          },
          {},
        );
        const updatedData = `LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,\r\n
        human,UPDATE,Care Home 1,31 Some Street,,,Leeds,LS1 2AD,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-workplace.csv'],
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
        const data = `${trainingHeaders},${newLine}
        human,Nurse Jones,31,Test,01/01/2020,01/01/2023,0,,`;

        sinon.stub(BulkUploadS3Utils, 'downloadContent').returns({ data });

        const saveResponse = sinon.stub(BulkUploadS3Utils, 'saveResponse');

        await uploadedFiles.uploadedStarGet(
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-training.csv'],
            query: { downloadType: 'Training' },
          },
          {},
        );
        const updatedData = `${trainingHeaders},${newLine}
        human,Nurse Jones,31,Test,01/01/2020,01/01/2023,0,,`;

        expect(saveResponse.getCalls()[0].args).to.deep.equal([
          {
            params: ['1/uploadedFiles/2022-01-01-sfc-bu-training.csv'],
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

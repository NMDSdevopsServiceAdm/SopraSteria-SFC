'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const S3 = require('../../../../../routes/establishments/bulkUpload/s3');

const uploadedFiles = require('../../../../../routes/establishments/bulkUpload/uploadFiles');

describe('/server/routes/establishment/uploadFiles.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('uploadedPut', () => {
    const TrainingFile = 'LOCALESTID,UNIQUEWORKERID,CATEGORY,DESCRIPTION,DATECOMPLETED,EXPIRYDATE,ACCREDITED,NOTES';
    const EstablishmentFile =
      'LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,ESTTYPE,OTHERTYPE,PERMCQC,PERMLA,REGTYPE,PROVNUM,LOCATIONID,MAINSERVICE,ALLSERVICES,CAPACITY,UTILISATION,SERVICEDESC,SERVICEUSERS,OTHERUSERDESC,TOTALPERMTEMP,ALLJOBROLES,STARTERS,LEAVERS,VACANCIES,REASONS,REASONNOS';
    const WorkerFile =
      'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,NINUMBER,POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,DISABLED,CARECERT,RECSOURCE,STARTDATE,STARTINSECT,APPRENTICE,EMPLSTATUS,ZEROHRCONT,DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,OTHERJOBROLE,OTHERJRDESC,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,QUALACH01,QUALACH01NOTES,QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';
    const OtherFile = 'Test,This,is,NOT,A,BULK,UPLOAD,FILE';

    sinon.stub(S3.s3, 'putObject').returns({
      promise: async () => {
        return {};
      },
    });

    it('Identifies establishment files', async () => {
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return {
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
          };
        },
      });
      var buff = Buffer.from(EstablishmentFile);
      sinon.stub(S3.s3, 'getObject').returns({
        promise: async () => {
          return {
            AcceptRanges: 'bytes',
            Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
            LastModified: '2021-01-26T14:28:35.000Z',
            ContentLength: 171,
            ETag: '""',
            VersionId: 'null',
            ContentType: 'application/json',
            Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
            Body: buff,
          };
        },
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

      const saveResponse = sinon.stub(S3, 'saveResponse');

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
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return {
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
          };
        },
      });
      var buff = Buffer.from(TrainingFile);
      sinon.stub(S3.s3, 'getObject').returns({
        promise: async () => {
          return {
            AcceptRanges: 'bytes',
            Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
            LastModified: '2021-01-26T14:28:35.000Z',
            ContentLength: 171,
            ETag: '""',
            VersionId: 'null',
            ContentType: 'application/json',
            Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
            Body: buff,
          };
        },
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

      const saveResponse = sinon.stub(S3, 'saveResponse');

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
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return {
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
          };
        },
      });
      var buff = Buffer.from(WorkerFile);
      sinon.stub(S3.s3, 'getObject').returns({
        promise: async () => {
          return {
            AcceptRanges: 'bytes',
            Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
            LastModified: '2021-01-26T14:28:35.000Z',
            ContentLength: 171,
            ETag: '""',
            VersionId: 'null',
            ContentType: 'application/json',
            Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
            Body: buff,
          };
        },
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

      const saveResponse = sinon.stub(S3, 'saveResponse');

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
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return {
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
          };
        },
      });
      var buff = Buffer.from(OtherFile);
      sinon.stub(S3.s3, 'getObject').returns({
        promise: async () => {
          return {
            AcceptRanges: 'bytes',
            Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
            LastModified: '2021-01-26T14:28:35.000Z',
            ContentLength: 171,
            ETag: '""',
            VersionId: 'null',
            ContentType: 'application/json',
            Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
            Body: buff,
          };
        },
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

      const saveResponse = sinon.stub(S3, 'saveResponse');

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
});

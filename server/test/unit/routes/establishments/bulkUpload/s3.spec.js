const sinon = require('sinon');
const S3 = require('../../../../../routes/establishments/bulkUpload/s3');
const expect = require('chai').expect;

const extraData = {
  LastModified: '2021-02-03T14:39:08.000Z',
  Size: 431,
};

const latestFiles = {
  Contents: [
    {
      Key: 'EstablishmentFile',
      ...extraData,
    },
    {
      Key: 'EstablishmentFile.metadata.json',
      ...extraData,
    },
    {
      Key: 'WorkerFile',
      ...extraData,
    },
    {
      Key: 'WorkerFile.metadata.json',
      ...extraData,
    },
  ],
};
const intermediaryFiles = {
  Contents: [
    {
      Key: 'intermediary1',
      ...extraData,
    },
    {
      Key: 'intermediary1.metadata.json',
      ...extraData,
    },
    {
      Key: 'intermediary2',
      ...extraData,
    },
    {
      Key: 'intermediary2.metadata.json',
      ...extraData,
    },
  ],
};
const validationFiles = {
  Contents: [
    {
      Key: 'OldFile1',
      ...extraData,
    },
    {
      Key: 'OldFile1.metadata.json',
      ...extraData,
    },
    {
      Key: 'OldFile2',
      ...extraData,
    },
    {
      Key: 'OldFile2.metadata.json',
      ...extraData,
    },
  ],
};

const filesToDelete = [
  {
    Key: 'filename1',
  },
  {
    Key: 'filename1.metadata.json',
  },
];

const listObjects = {
  Contents: [
    ...filesToDelete,
    {
      Key: 'filename2',
    },
  ],
};

const deleteFiles = {
  Bucket: 'sfcbulkuploadfiles',
  Delete: {
    Objects: [...filesToDelete],
    Quiet: true,
  },
};

describe('s3', () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {});
  describe('deleteFilesS3', () => {
    it('should delete the files from s3', async () => {
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return listObjects;
        },
      });
      const deleteObjects = sinon.stub(S3.s3, 'deleteObjects');
      deleteObjects.returns({
        promise: async () => {
          return;
        },
      });
      await S3.deleteFilesS3(123, 'filename1');
      sinon.assert.calledWith(deleteObjects, deleteFiles);
    });
  });
  describe('purgeBulkUploadS3Objects', () => {
    it('should delete all the files', async () => {
      const listObjects = sinon.stub(S3.s3, 'listObjects');

      listObjects.withArgs({ Bucket: 'sfcbulkuploadfiles', Prefix: '1/latest/' }).returns({
        promise: async () => {
          return latestFiles;
        },
      });
      listObjects.withArgs({ Bucket: 'sfcbulkuploadfiles', Prefix: '1/validation/' }).returns({
        promise: async () => {
          return validationFiles;
        },
      });
      listObjects.withArgs({ Bucket: 'sfcbulkuploadfiles', Prefix: '1/intermediary/' }).returns({
        promise: async () => {
          return intermediaryFiles;
        },
      });

      const deleteObjects = sinon.stub(S3.s3, 'deleteObjects');
      deleteObjects.returns({
        promise: async () => {
          return;
        },
      });

      const consolidateFiles = [...latestFiles.Contents, ...validationFiles.Contents, ...intermediaryFiles.Contents];

      const justTheKeys = consolidateFiles.map((file) => {
        return { Key: file.Key };
      });

      const expectedResult = {
        Bucket: 'sfcbulkuploadfiles',
        Delete: {
          Objects: justTheKeys,
          Quiet: true,
        },
      };
      await S3.purgeBulkUploadS3Objects(1);

      sinon.assert.calledWith(deleteObjects, expectedResult);
    });
  });
  describe('listMetaData', () => {
    it('should list the files from s3', async () => {
      sinon.stub(S3.s3, 'listObjects').returns({
        promise: async () => {
          return latestFiles;
        },
      });
      const getObject = sinon.stub(S3.s3, 'getObject');

      var workerFileBuffer = Buffer.from(
        '{\n' +
          '  "username": "george-benchmarking",\n' +
          '  "filename": "WorkerFile.csv",\n' +
          '  "fileType": "Worker",\n' +
          '  "records": 11,\n' +
          '  "errors": 0,\n' +
          '  "warnings": 0,\n' +
          '  "deleted": 0\n' +
          '}',
      );
      getObject
        .withArgs({
          Bucket: S3.Bucket,
          Key: 'WorkerFile.metadata.json',
        })
        .returns({
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
              Body: workerFileBuffer,
            };
          },
        });
      var establishmentFileBuffer = Buffer.from(
        '{\n' +
          '  "username": "george-benchmarking",\n' +
          '  "filename": "EstablishmentFile.csv",\n' +
          '  "fileType": "Establishment",\n' +
          '  "records": 11,\n' +
          '  "errors": 0,\n' +
          '  "warnings": 0,\n' +
          '  "deleted": 0\n' +
          '}',
      );
      getObject
        .withArgs({
          Bucket: S3.Bucket,
          Key: 'EstablishmentFile.metadata.json',
        })
        .returns({
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
              Body: establishmentFileBuffer,
            };
          },
        });
      const results = await S3.listMetaData(123, '/lastBulkUpload/');
      const expectedResult = [
        {
          key: 'EstablishmentFile.metadata.json',
          data: {
            username: 'george-benchmarking',
            filename: 'EstablishmentFile.csv',
            fileType: 'Establishment',
            records: 11,
            errors: 0,
            warnings: 0,
            deleted: 0,
            key: 'EstablishmentFile',
          },
          filename: 'EstablishmentFile.metadata.json',
          username: 'george-benchmarking',
          size: 431,
          lastModified: '2021-02-03T14:39:08.000Z',
        },
        {
          key: 'WorkerFile.metadata.json',
          data: {
            username: 'george-benchmarking',
            filename: 'WorkerFile.csv',
            fileType: 'Worker',
            records: 11,
            errors: 0,
            warnings: 0,
            deleted: 0,
            key: 'WorkerFile',
          },
          filename: 'WorkerFile.metadata.json',
          username: 'george-benchmarking',
          size: 431,
          lastModified: '2021-02-03T14:39:08.000Z',
        },
      ];

      expect(results).to.deep.equal(expectedResult);
    });
  });
});

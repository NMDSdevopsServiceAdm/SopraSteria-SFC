const sinon = require('sinon');
const BulkUploadS3Utils = require('../../../../../routes/establishments/bulkUpload/s3');
const bulkUploadS3Client = require('../../../../../routes/establishments/bulkUpload/bulkUploadS3Client');
const { buildGetObjectResponseBody } = require('./testUtils');
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

describe('BulkUploadS3Utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteFilesS3', () => {
    it('should delete the files from s3', async () => {
      sinon.stub(bulkUploadS3Client, 'listObjects').resolves(listObjects);

      const deleteObjects = sinon.stub(bulkUploadS3Client, 'deleteObjects').resolves();
      await BulkUploadS3Utils.deleteFilesS3(123, 'filename1');
      sinon.assert.calledWith(deleteObjects, deleteFiles);
    });

    it('should handle the case when listObjects found no result', async () => {
      sinon.stub(bulkUploadS3Client, 'listObjects').resolves({});
      const deleteObjects = sinon.stub(bulkUploadS3Client, 'deleteObjects');

      await BulkUploadS3Utils.deleteFilesS3(123, 'filename1');
      sinon.assert.notCalled(deleteObjects);
    });
  });

  describe('purgeBulkUploadS3Objects', () => {
    it('should delete all the files', async () => {
      const s3listObject = sinon.stub(bulkUploadS3Client, 'listObjects');
      s3listObject.callsFake(async (listParams) => {
        switch (listParams?.Prefix) {
          case '1/latest/':
            return latestFiles;
          case '1/validation/':
            return validationFiles;
          case '1/intermediary/':
            return intermediaryFiles;
        }
      });

      const deleteObjects = sinon.stub(bulkUploadS3Client, 'deleteObjects');
      deleteObjects.resolves();
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
      await BulkUploadS3Utils.purgeBulkUploadS3Objects(1);

      sinon.assert.calledWith(deleteObjects, expectedResult);
    });

    it('should handle the case when listObjects found no result', async () => {
      sinon.stub(bulkUploadS3Client, 'listObjects').resolves({});
      const deleteObjects = sinon.stub(bulkUploadS3Client, 'deleteObjects');

      await BulkUploadS3Utils.deleteFilesS3(123, 'filename1');
      sinon.assert.notCalled(deleteObjects);
    });
  });

  describe('listMetaData', () => {
    it('should list the files from s3', async () => {
      sinon.stub(bulkUploadS3Client, 'listObjects').resolves(latestFiles);

      const getObject = sinon.stub(bulkUploadS3Client, 'getObject');

      const workerFileBody = buildGetObjectResponseBody(
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
          Bucket: BulkUploadS3Utils.bulkUploadBucket,
          Key: 'WorkerFile.metadata.json',
        })
        .resolves({
          AcceptRanges: 'bytes',
          Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
          LastModified: '2021-01-26T14:28:35.000Z',
          ContentLength: 171,
          ETag: '""',
          VersionId: 'null',
          ContentType: 'application/json',
          Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
          Body: workerFileBody,
        });
      const establishmentFileBody = buildGetObjectResponseBody(
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
          Bucket: BulkUploadS3Utils.bulkUploadBucket,
          Key: 'EstablishmentFile.metadata.json',
        })
        .resolves({
          AcceptRanges: 'bytes',
          Expiration: 'expiry-date="Wed, 03 Feb 2021 00:00:00 GMT", rule-id="auto-delete"',
          LastModified: '2021-01-26T14:28:35.000Z',
          ContentLength: 171,
          ETag: '""',
          VersionId: 'null',
          ContentType: 'application/json',
          Metadata: { username: 'george-benchmarking', establishmentid: '2000' },
          Body: establishmentFileBody,
        });

      const results = await BulkUploadS3Utils.listMetaData(123, '/lastBulkUpload/');
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

    it('should handle the case when listObjects found no result', async () => {
      sinon.stub(bulkUploadS3Client, 'listObjects').resolves({});

      const getObject = sinon.stub(bulkUploadS3Client, 'getObject');

      const results = await BulkUploadS3Utils.listMetaData(123, '/lastBulkUpload/');

      expect(getObject).not.to.be.called;
      expect(results).to.deep.equal([]);
    });
  });
});

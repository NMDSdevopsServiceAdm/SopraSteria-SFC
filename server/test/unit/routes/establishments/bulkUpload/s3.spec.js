const sinon = require('sinon');
const { s3, deleteFilesS3 } = require('../../../../../routes/establishments/bulkUpload/s3');

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
      sinon.stub(s3, 'listObjects').returns({
        promise: async () => {
          return listObjects;
        },
      });
      const deleteObjects = sinon.stub(s3, 'deleteObjects');
      deleteObjects.returns({
        promise: async () => {
          return;
        },
      });
      await deleteFilesS3(123, 'filename1');
      sinon.assert.calledWith(deleteObjects, deleteFiles);
    });
  });
});

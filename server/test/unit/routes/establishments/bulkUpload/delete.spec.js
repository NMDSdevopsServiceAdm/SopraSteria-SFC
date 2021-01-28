const expect = require('chai').expect;
const sinon = require('sinon');
const { deleteFiles } = require('../../../../../routes/establishments/bulkUpload/delete');
const s3 = require('../../../../../routes/establishments/bulkUpload/s3');
const httpMocks = require('node-mocks-http');

describe('delete', () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {});

  const fileName = 'file1';
  const filesList = [{ Key: fileName }];
  const establishmentId = 123;

  it('should return status 200 if the file is found', async () => {
    sinon.stub(s3, 'findFilesS3').returns(filesList);
    const deleteFilesFn = sinon.stub(s3, 'deleteFilesS3');
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/bulkupload/delete/${fileName}`,
      params: {
        establishmentId,
        fileName,
      },
    });

    req.establishmentId = establishmentId;
    const res = httpMocks.createResponse();

    await deleteFiles(req, res);
    sinon.assert.calledOnce(deleteFilesFn);
    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return status 404 if the file is not found', async () => {
    sinon.stub(s3, 'findFilesS3').returns([]);
    const deleteFilesFn = sinon.stub(s3, 'deleteFilesS3');
    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/bulkupload/delete/${fileName}`,
      params: {
        establishmentId,
        fileName,
      },
    });

    req.establishmentId = establishmentId;
    const res = httpMocks.createResponse();

    await deleteFiles(req, res);
    sinon.assert.notCalled(deleteFilesFn);
    expect(res.statusCode).to.deep.equal(404);
  });
});

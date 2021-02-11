const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
// const sinon = require('sinon');

const { moveWorkplaceAdmin } = require('../../../../../routes/admin/move-workplace');

describe('server/routes/admin/moveWorkplaceAdmin.js', () => {
  it('should return status 200', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/admin/move-workplace',
      body: {
        parentUid: '4698f4a4-ab82-4906-8b0e-3f4972375927',
        subsidUid: '1238f4a4-ab82-4906-8b0e-3f4972375927',
      },
    });

    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return status 400 for invalid parentUid', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/admin/move-workplace',
      body: {
        parentUid: '1',
      },
    });

    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);
    expect(res.statusCode).to.deep.equal(400);
  });

  it('should return status 400 for invalid subsidUID', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/admin/move-workplace',
      body: {
        subsidUid: '1',
      },
    });

    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);
    expect(res.statusCode).to.deep.equal(400);
  });
});

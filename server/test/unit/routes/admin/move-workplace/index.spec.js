const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
// const sinon = require('sinon');

const { moveWorkplaceAdmin } = require('../../../../../routes/admin/move-workplace');

describe('server/routes/admin/moveWorkplaceAdmin.js', () => {
  it('should return status 200', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/admin/move-workplace',
      params: {},
    });

    const res = httpMocks.createResponse();

    await moveWorkplaceAdmin(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });
});

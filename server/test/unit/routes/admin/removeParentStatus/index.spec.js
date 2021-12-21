const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const { removeParentStatus } = require('../../../../../routes/admin/remove-parent-status');

describe('removeParentStatus', () => {
  const establishmentId = 12345;
  let req;
  let res;

  beforeEach(() => {
    const request = {
      method: 'POST',
      url: `/api/establishment/${establishmentId}/remove-parent-status`,
      establishmentId,
      body: {
        isParent: false,
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => sinon.restore());

  it('should reply with a status of 200', async () => {
    sinon.stub(models.establishment, 'updateEstablishment').callThrough();

    await removeParentStatus(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 500 when an error is thrown', async () => {
    sinon.stub(models.establishment, 'updateEstablishment').throws();

    await removeParentStatus(req, res);
    expect(res.statusCode).to.deep.equal(500);
  });
});

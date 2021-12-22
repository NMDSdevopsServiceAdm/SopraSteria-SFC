const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const { removeParentStatus } = require('../../../../../routes/admin/remove-parent-status');

describe('removeParentStatus', () => {
  const establishmentId = 'a131313dasd123325453bac';
  let req;
  let res;

  beforeEach(() => {
    const request = {
      method: 'POST',
      url: `/api/establishment/${establishmentId}/remove-parent-status`,
      body: {
        establishmentId,
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should reply with a status of 200', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({ id: 1 });
    sinon.stub(models.establishment, 'updateEstablishment').callThrough();

    await removeParentStatus(req, res);
    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 400 error code when given an incorrect establishment ID', async () => {
    sinon.stub(models.establishment, 'findByUid').returns(null);

    await removeParentStatus(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(400);
    expect(message).to.equal('Establishment could not be found');
  });

  it('should return 500 when an error is thrown by updateEstablishment', async () => {
    sinon.stub(models.establishment, 'findByUid').throws();

    await removeParentStatus(req, res);
    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(500);
    expect(message).to.equal('There was an error removing parent status');
  });

  it('should return 500 when an error is thrown by updateEstablishment', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({ id: 1 });
    sinon.stub(models.establishment, 'updateEstablishment').throws();

    await removeParentStatus(req, res);

    const { message } = res._getJSONData();

    expect(res.statusCode).to.deep.equal(500);
    expect(message).to.equal('There was an error removing parent status');
  });
});

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { updateRegistrationStatus } = require('../../../../../routes/admin/registrations/updateRegistrationStatus');

describe('updateRegistrationStatus', () => {
  const request = {
    method: 'POST',
    url: '/api/admin/registrations/updateRegistrationStatus',
    body: {
      status: 'IN PROGRESS',
      uid: 'someuid',
      reviewer: 'admin',
      inReview: true,
    },
  };

  const req = httpMocks.createRequest(request);
  const res = httpMocks.createResponse();

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 when the pending flag gets updated', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({
      uid: 'someuid',
      ustatus: 'PENDING',
      reviewer: null,
      inReview: false,
      save() {
        return true;
      },
    });

    await updateRegistrationStatus(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 400 when the establishment cannot be found', async () => {
    sinon.stub(models.establishment, 'findByUid').returns(null);

    await updateRegistrationStatus(req, res);
    const expectedResponse = { error: 'Workplace could not be found' };

    expect(res.statusCode).to.deep.equal(400);
    expect(res._getData()).to.deep.equal(expectedResponse);
  });

  it('should return 400 if there is already a different reviewer on the registration', async () => {
    sinon.stub(models.establishment, 'findByUid').returns({
      uid: 'someuid',
      reviewer: 'anotherAdmin',
      inReview: true,
      ustatus: 'IN PROGRESS',
    });

    await updateRegistrationStatus(req, res);
    const expectedResponse = { error: 'This registration is already in progress' };

    expect(res.statusCode).to.deep.equal(400);
    expect(res._getData()).to.deep.equal(expectedResponse);
  });

  it('should return 500 when an error is thrown', async () => {
    sinon.stub(models.establishment, 'findByUid').throws();

    await updateRegistrationStatus(req, res);
    expect(res.statusCode).to.deep.equal(500);
  });
});

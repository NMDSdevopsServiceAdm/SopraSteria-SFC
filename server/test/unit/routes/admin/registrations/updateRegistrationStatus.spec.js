const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const { updateRegistrationStatus } = require('../../../../../routes/admin/registrations/updateRegistrationStatus');

describe.only('updateRegistrationStatus', () => {
  const request = {
    method: 'POST',
    url: '/api/admin/registrations/updateRegistrationStatus',
    body: {
      status: 'IN PROGRESS',
      uid: 'someuid',
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
      status: 'IN PROGRESS',
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
    expect(res.statusCode).to.deep.equal(400);
  });

  it('should return 500 when an error is thrown', async () => {
    sinon.stub(models.establishment, 'findByUid').throws();

    await updateRegistrationStatus(req, res);
    expect(res.statusCode).to.deep.equal(500);
  });
});

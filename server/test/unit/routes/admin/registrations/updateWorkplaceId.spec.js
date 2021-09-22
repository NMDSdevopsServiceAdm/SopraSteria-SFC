const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);
const httpMocks = require('node-mocks-http');

const models = require('../../../../../models');

const registrations = require('../../../../../routes/admin/registrations/updateWorkplaceId');

describe('updateWorkplaceId', async () => {
  const request = {
    method: 'POST',
    url: '/api/admin/registrations/updateWorkplaceId',
    body: {
      nmdsId: 'A1234567',
      uid: 'c13888123ac',
    },
  };

  const req = httpMocks.createRequest(request);
  const res = httpMocks.createResponse();

  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 status when workplace ID already exists', async () => {
    sinon.stub(models.establishment, 'findOne').returns({ id: 'A1234567' });

    await registrations.updateWorkplaceId(req, res);

    expect(res.statusCode).to.deep.equal(400);
  });

  it('should return 200 status when workplace ID does not already exist and workplace id successfully updated', async () => {
    sinon.stub(models.establishment, 'findOne').returns(null);
    sinon.stub(models.establishment, 'findByUid').returns({
      nmdsId: 'A1234513',
      uid: 'c13888123ac',
      save() {
        return true;
      },
    });

    await registrations.updateWorkplaceId(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return 500 status when error is thrown', async () => {
    sinon.stub(models.establishment, 'findOne').returns(null);
    sinon.stub(models.establishment, 'findByUid').throws();

    await registrations.updateWorkplaceId(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

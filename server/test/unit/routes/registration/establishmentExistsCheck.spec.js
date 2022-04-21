const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { establishmentExistsCheck } = require('../../../../routes/registration/establishmentExistsCheck');

describe.only('server/routes/establishments/establishmentExistsCheck', () => {
  let req;
  let res;

  afterEach(() => {
    sinon.restore();
  });

  describe('establishmentExistsCheck', () => {
    beforeEach(() => {
      const request = {
        method: 'GET',
        url: '/api/establishment/establishmentExistsCheck/1-1234567890',
        params: {
          postcodeOrLocationID: '1-1234567890',
        },
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    it('should return 200 with exists set to true when there is an establishment in the database with the same locationId', async () => {
      sinon.stub(models.establishment, 'findByLocationID').returns({
        locationId: '1-1234567890',
      });

      await establishmentExistsCheck(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ exists: true });
    });

    it('should return 200 with exists set to false when there is not an establishment in the database with the same locationId', async () => {
      sinon.stub(models.establishment, 'findByLocationID').returns(null);

      await establishmentExistsCheck(req, res);

      expect(res.statusCode).to.deep.equal(200);
      expect(res._getJSONData()).to.deep.equal({ exists: false });
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'findByLocationID').throws();

      await establishmentExistsCheck(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

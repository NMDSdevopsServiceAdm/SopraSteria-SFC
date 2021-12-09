const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const expiresSoonAlertDates = require('../../../../routes/establishments/expiresSoonAlertDates');

describe('server/routes/establishments/expiresSoonAlertDates', () => {
  beforeEach(() => {});

  afterEach(() => {
    sinon.restore();
  });

  describe('getExpiresSoonAlertDates', () => {
    it('should return 200 with the current expires soon alert date', async () => {
      sinon.stub(models.establishment, 'getExpiresSoonAlertDate').returns({
        get: () => {
          return '90';
        },
      });

      const establishmentId = 'a131313dasd123325453bac';

      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
        establishment: {
          id: 1,
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await expiresSoonAlertDates.getExpiresSoonAlertDate(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.expiresSoonAlertDate).to.deep.equal('90');
    });

    it('should return 500 when there is an error', async () => {
      sinon.stub(models.establishment, 'getExpiresSoonAlertDate').throws();

      const establishmentId = 'a131313dasd123325453bac';
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
        establishment: {
          id: 1,
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await expiresSoonAlertDates.getExpiresSoonAlertDate(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

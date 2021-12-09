const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const expiresSoonAlertDates = require('../../../../routes/establishments/expiresSoonAlertDates');

describe('server/routes/establishments/expiresSoonAlertDates', () => {
  const establishmentId = 'a131313dasd123325453bac';

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

  describe('setExpiresSoonAlertDates', () => {
    it('should return 200 when setting the expires soon alert dates', async () => {
      sinon.stub(models.establishment, 'updateEstablishment').callsFake();

      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
        establishment: {
          id: 1,
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await expiresSoonAlertDates.setExpiresSoonAlertDate(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 500 when there is an error', async () => {
      sinon.stub(models.establishment, 'updateEstablishment').throws();

      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
        establishment: {
          id: 1,
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await expiresSoonAlertDates.setExpiresSoonAlertDate(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

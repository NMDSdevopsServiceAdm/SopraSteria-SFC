const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const expiresSoonAlertDates = require('../../../../routes/establishments/expiresSoonAlertDates');

describe.only('server/routes/establishments/expiresSoonAlertDates', () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('getExpiresSoonAlertDates', () => {
    it('should return 200 with the current expires soon alert date', async () => {
      const establishmentId = 'a131313dasd123325453bac';

      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/updateSharingPermissionsBanner`,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await expiresSoonAlertDates.getExpiresSoonAlertDate(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.expiresSoonAlertDate).to.deep.equal('90');
    });

  });
});

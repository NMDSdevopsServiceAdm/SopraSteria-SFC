const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { getWorkplaceWorkersWithHealthAndCareVisa } = require('../../../../routes/establishments/healthAndCareVisa');

describe('server/routes/establishments/healthAndCareVisa', () => {
  describe('getWorkplaceWorkersWithHealthAndCareVisa', () => {
    const establishmentId = 'a131313dasd123325453bac';
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/healthAndCareVisa`,
        establishmentId,
      };
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.worker, 'getWorkersWithHealthAndCareVisaForWorkplace').throws();

      await getWorkplaceWorkersWithHealthAndCareVisa(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 200 status and formatted workers data from db call when valid req', async () => {
      const mockWorkers = [
        {
          id: 101,
          uid: 'dcb49c30-e57d-47bc-9e4e-2e5d771aae5e',
          NameOrIdValue: 'Tim',
        },
      ];

      const expectedReturnData = [
        {
          id: 101,
          uid: 'dcb49c30-e57d-47bc-9e4e-2e5d771aae5e',
          nameOrId: 'Tim',
        },
      ];

      sinon.stub(models.worker, 'getWorkersWithHealthAndCareVisaForWorkplace').returns(mockWorkers);

      await getWorkplaceWorkersWithHealthAndCareVisa(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);
      expect(response.workersWithHealthAndCareVisas).to.deep.equal(expectedReturnData);
    });
  });
});

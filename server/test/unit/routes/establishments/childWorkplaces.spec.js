const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { getChildWorkplaces } = require('../../../../routes/establishments/childWorkplaces');

describe('server/routes/establishments/childWorkplaces', () => {
  describe('getChildWorkplaces', () => {
    const establishmentId = 'a131313dasd123325453bac';
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/childWorkplaces`,
        establishmentId,
      };
      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'getChildWorkplaces').throws();

      await getChildWorkplaces(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 200 status and child workplace data from db call when valid req', async () => {
      const modelData = [
        {
          dataOwner: 'Workplace',
          dataOwnershipRequested: null,
          dataPermissions: null,
          mainService: 'Carers support',
          name: '12345',
          uid: 'ca720581-5319-4ae8-b941-a5a4071ab828',
          updated: '2022-01-31T16:40:27.780Z',
          ustatus: null,
        },
      ];

      sinon.stub(models.establishment, 'getChildWorkplaces').returns(modelData);

      await getChildWorkplaces(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);
      expect(response.childWorkplaces).to.deep.equal(modelData);
    });
  });
});

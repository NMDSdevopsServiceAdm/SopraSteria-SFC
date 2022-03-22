const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

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

    it('should return 200 when valid req passed in', async () => {
      await getChildWorkplaces(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });
  });
});

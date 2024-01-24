const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const CQCProviderDataAPI = require('../../../../utils/CQCProviderDataAPI');

const { cqcProvider } = require('../../../../routes/cqcProvider');

describe('server/routes/establishments/cqcProvider', async () => {
  describe('get locationIDs', async () => {
    beforeEach(() => {
      sinon.stub(CQCProviderDataAPI, 'getCQCProviderData').callsFake(async (locationID) => {
        return {
          providerId: '1-2003',
          locationIds: ['1-12427547986', '1-2043158439', '1-5310224737'],
        };
      });
    });

    afterEach(async () => {
      sinon.restore();
    });

    it('should return a 200 status when call is successful', async () => {
      const request = {
        method: 'GET',
        url: `/api/cqcProvider`,
        params: {
          locationID: '1-2003',
        },
        query: {
          establishmentUid: 'some-uuid',
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await cqcProvider(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });
  });
});

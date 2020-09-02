const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../models/index');
const fluJabRoute = require('../../../../../routes/establishments/fluJab');

const setup = (establishmentId) => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: `/api/admin/flu-jab/workplace`,
    establishmentId,
  });
  const res = httpMocks.createResponse();
  return { req, res};
}

describe('server/routes/admin/flu-jab', () => {
  describe('workplace', () => {
    it('should find all flu jabs for workplace', async () => {
      const workplaceId = 1;
      let fluJabsByEstablishmentId = sinon.spy(models.worker, "fluJabsByEstablishmentId");

      const { req, res } = setup(workplaceId);

      await fluJabRoute.workplaceFluJabs(req, res);

      expect(fluJabsByEstablishmentId.called).to.deep.equal(true);
      expect(fluJabsByEstablishmentId.args[0][0]).to.deep.equal(workplaceId);
    })

    it('should map data from database to model for frontend', async () => {
      sinon.stub(models.worker, 'findAll').returns([
        {
          "id": 1,
          "uid": "e8d8ecb1-1d62-475c-850c-451e8588880f",
          "NameOrIdValue": "Joe Bloggs",
          "FluJabValue": "Yes",
        }
      ]);

      const { req, res } = setup(1);

      await fluJabRoute.workplaceFluJabs(req, res);

      const response = res._getJSONData();

      expect(response).to.deep.equal([{
        "id": 1,
        "uid": "e8d8ecb1-1d62-475c-850c-451e8588880f",
        "name": "Joe Bloggs",
        "fluJab": "Yes"
      }]);
    })
  })
})

const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../../models');
const dataChangeLastUpdate = require('../../../../../routes/establishments/bulkUpload/dataChange');

describe('server/routes/establishments/bulkUpload/dataChange', () => {
  const establishmentId = 'a131313dasd123325453bac';

  afterEach(() => {
    sinon.restore();
  });

  describe.only('getDataChangesLastUpdated', () => {
    it('should return 200 with the Data change last update', async () => {
      sinon.stub(models.establishment, 'getdataChangesLastUpdated').returns({
        get: () => {
          return 'Fri Jan 14 2022';
        },
      });

      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/bulkUpload/dataChange`,
        establishment: { id: establishmentId },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await dataChangeLastUpdate.getDataChangesLastUpdated(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response.dataChangesLastUpdate).to.deep.equal('Fri Jan 14 2022');
    });
  });
});

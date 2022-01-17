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

  describe('getDataChangesLastUpdated', () => {
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

    it('should return 500 when there is an error', async () => {
      sinon.stub(models.establishment, 'getdataChangesLastUpdated').throws();
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/bulkUpload/dataChange`,
        establishment: { id: establishmentId },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await dataChangeLastUpdate.getDataChangesLastUpdated(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
  describe('updateBUDataChanges', () => {
    it('should return 200 when updating the DataChange Last Updated', async () => {
      sinon.stub(models.establishment, 'updateDataChangesLastUpdatedDate').callsFake();

      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/bulkUpload/dataChange`,
        establishment: { id: establishmentId },
        body: {
          lastUpdated: 'Fri Jan 14 2022',
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await dataChangeLastUpdate.updateBUDataChanges(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 500 when there is an error', async () => {
      sinon.stub(models.establishment, 'updateDataChangesLastUpdatedDate').throws();

      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/bulkUpload/dataChange`,
        establishment: { id: establishmentId },
        body: {
          lastUpdated: 'Fri Jan 14 2022',
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await dataChangeLastUpdate.updateBUDataChanges(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { getChildWorkplaces, formatChildWorkplaces } = require('../../../../routes/establishments/childWorkplaces');

describe('server/routes/establishments/childWorkplaces', () => {
  let modelData;
  beforeEach(() => {
    modelData = {
      rows: [
        {
          dataOwner: 'Workplace',
          dataOwnershipRequested: null,
          dataPermissions: null,
          mainService: { name: 'Carers support' },
          NameValue: '12345',
          uid: 'ca720581-5319-4ae8-b941-a5a4071ab828',
          updated: '2022-01-31T16:40:27.780Z',
          ustatus: null,
        },
      ],
      count: 1,
    };
  });
  describe('getChildWorkplaces', () => {
    const establishmentId = 'a131313dasd123325453bac';
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: `/api/establishment/${establishmentId}/childWorkplaces`,
        establishmentId,
        params: {
          id: 'testId',
        },
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

    it('should return 200 status and formatted child workplace data from db call when valid req', async () => {
      sinon.stub(models.establishment, 'getChildWorkplaces').returns(modelData);

      await getChildWorkplaces(req, res);

      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);
      expect(response.childWorkplaces).to.deep.equal([
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
      ]);
    });

    it('should return count from db call', async () => {
      sinon.stub(models.establishment, 'getChildWorkplaces').returns(modelData);

      await getChildWorkplaces(req, res);

      const response = res._getJSONData();

      expect(response.count).to.equal(1);
    });

    it('should call getChildWorkplaces on establishment model with establishmentId, itemsPerPage and pageIndex', async () => {
      const modelStub = sinon.stub(models.establishment, 'getChildWorkplaces').returns(modelData);

      req.query.itemsPerPage = 12;
      req.query.pageIndex = 2;

      await getChildWorkplaces(req, res);

      expect(modelStub.args[0][0]).to.equal(req.params.id);
      expect(modelStub.args[0][1]).to.equal(req.query.itemsPerPage);
      expect(modelStub.args[0][2]).to.equal(req.query.pageIndex);
    });
  });

  describe('formatChildWorkplaces', () => {
    it('Should rename NameValue to name', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData.rows);

      expect(formattedChildWorkplaces[0].name).to.equal('12345');
      expect(formattedChildWorkplaces[0].NameValue).to.equal(undefined);
    });

    it('Should modify mainService object to be a string', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData.rows);

      expect(formattedChildWorkplaces[0].mainService).to.equal('Carers support');
    });

    it('Should only affect mainService.name and NameValue properties when formatChildWorkplace is called', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData.rows);

      expect(formattedChildWorkplaces[0].dataOwner).to.equal(modelData.rows[0].dataOwner);
      expect(formattedChildWorkplaces[0].dataOwnershipRequested).to.equal(modelData.rows[0].dataOwnershipRequested);
      expect(formattedChildWorkplaces[0].dataPermissions).to.equal(modelData.rows[0].dataPermissions);
      expect(formattedChildWorkplaces[0].uid).to.equal(modelData.rows[0].uid);
      expect(formattedChildWorkplaces[0].updated).to.equal(modelData.rows[0].updated);
      expect(formattedChildWorkplaces[0].ustatus).to.equal(modelData.rows[0].ustatus);
    });
  });
});

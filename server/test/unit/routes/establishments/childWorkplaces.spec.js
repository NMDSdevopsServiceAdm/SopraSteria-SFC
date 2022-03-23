const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const { getChildWorkplaces, formatChildWorkplaces } = require('../../../../routes/establishments/childWorkplaces');

describe('server/routes/establishments/childWorkplaces', () => {
  let modelData;
  beforeEach(() => {
    modelData = [
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
    ];
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
  });

  describe('formatChildWorkplaces', () => {
    it('Should rename NameValue to name', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData);

      expect(formattedChildWorkplaces[0].name).to.equal('12345');
      expect(formattedChildWorkplaces[0].NameValue).to.equal(undefined);
    });

    it('Should modify mainService object to be a string', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData);

      expect(formattedChildWorkplaces[0].mainService).to.equal('Carers support');
    });

    it('Should only affect mainService.name and NameValue properties when formatChildWorkplace is called', () => {
      const formattedChildWorkplaces = formatChildWorkplaces(modelData);

      expect(formattedChildWorkplaces[0].dataOwner).to.equal(modelData[0].dataOwner);
      expect(formattedChildWorkplaces[0].dataOwnershipRequested).to.equal(modelData[0].dataOwnershipRequested);
      expect(formattedChildWorkplaces[0].dataPermissions).to.equal(modelData[0].dataPermissions);
      expect(formattedChildWorkplaces[0].uid).to.equal(modelData[0].uid);
      expect(formattedChildWorkplaces[0].updated).to.equal(modelData[0].updated);
      expect(formattedChildWorkplaces[0].ustatus).to.equal(modelData[0].ustatus);
    });
  });
});

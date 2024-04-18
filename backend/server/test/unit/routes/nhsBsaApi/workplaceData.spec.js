const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { nhsBsaApi } = require('../../../../routes/nhsBsaApi/workplaceData');
const models = require('../../../../models');

describe('server/routes/nhsBsaApi/workplaceData.js', () => {
  const workplaceId = 'F1005083';
  let result;
  result = {
    id: 949,
    nmdsId: 'J1001845',
    NameValue: 'SKILLS FOR CARE',
    address1: 'WEST GATE',
    locationId: null,
    town: 'LEEDS',
    postcode: 'LS1 2RP',
    isParent: false,
    dataOwner: 'Workplace',
    NumberOfStaffValue: 2,
    parentId: null,
    mainService: {
      name: 'Domiciliary care services',
      category: 'Adult domiciliary',
    },
  };

  beforeEach(() => {
    const request = {
      method: 'GET',
      url: `/api/v1/workplaces/${workplaceId}`,

      params: {
        nmdsId: workplaceId,
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('nhsBsaApiData', () => {
    it('should return 200 when successfully retrieving a workplace data ', async () => {
      sinon.stub(models.establishment, 'nhsBsaApiData').returns([result]);

      await nhsBsaApi(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);

      expect(response.workplaceData).to.deep.equal([
        {
          workplaceDetails: {
            workplaceId: 'J1001845',
            workplaceName: 'SKILLS FOR CARE',
            dataOwner: 'Workplace',
            workplaceAddress: {
              firstLine: 'WEST GATE',
              town: 'LEEDS',
              postCode: 'LS1 2RP',
            },
            locationId: null,
            numberOfWorkplaceStaff: 2,
            serviceName: 'Domiciliary care services',
            serviceCategory: 'Adult domiciliary',
            eligibilityPercentage: 0,
            eligibilityDate: '2021-05-13T09:27:34.471Z',
            isEligible: 'false',
          },
        },
      ]);
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'nhsBsaApiData').throws();
      await nhsBsaApi(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

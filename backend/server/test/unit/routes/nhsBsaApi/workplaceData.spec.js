const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { nhsBsaApi, subsidiariesList, wdfData } = require('../../../../routes/nhsBsaApi/workplaceData');
const models = require('../../../../models');

describe('server/routes/nhsBsaApi/workplaceData.js', () => {
  const workplaceId = 'J1001845';
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
        workplaceId: workplaceId,
      },
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('nhsBsaApi', () => {
    it('should return 200 when successfully retrieving a workplace data ', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

      await nhsBsaApi(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.equal(200);

      expect(response.workplaceData).to.deep.equal({
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
          isEligible: false,
        },
      });
    });

    it('should return successfully a list of subsidiaries', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataForSubs').returns([result]);

      const establishmentId = result.id;

      const subs = await subsidiariesList(establishmentId);

      expect(subs).to.deep.equal([
        {
          workplaceId: 'J1001845',
          workplaceName: 'SKILLS FOR CARE',
          dataOwner: 'Workplace',
          workplaceAddress: { firstLine: 'WEST GATE', town: 'LEEDS', postCode: 'LS1 2RP' },
          locationId: null,
          numberOfWorkplaceStaff: 2,
          serviceName: 'Domiciliary care services',
          serviceCategory: 'Adult domiciliary',
          eligibilityPercentage: 0,
          eligibilityDate: new Date('2021-05-13T09:27:34.471Z'),
          isEligible: false,
        },
      ]);
    });

    it('should return 404 when workplace is not found', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(null);
      await nhsBsaApi(req, res);

      expect(res.statusCode).to.deep.equal(404);
      expect(res._getJSONData()).to.deep.equal({ error: 'Can not find this Id.' });
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').throws();
      await nhsBsaApi(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('wdfData', () => {
    const establishmentId = 'A1234567';

    const returnData = (WorkerCompletedCount = 1, WorkerCount = 4, OverallWdfEligibility = null) => {
      return [
        {
          EstablishmentID: establishmentId,
          WorkerCompletedCount,
          WorkerCount,
          OverallWdfEligibility,
        },
      ];
    };

    it('should return isEligible as false when no date returned for OverallWdfEligibility', async () => {
      sinon.stub(models.sequelize, 'query').returns(returnData(1, 4, null));
      const effectiveTime = new Date('2022-05-13T09:27:34.471Z').getTime();
      const wdf = await wdfData(establishmentId, effectiveTime);

      expect(wdf.isEligible).to.equal(false);
      expect(wdf.eligibilityDate).to.equal(null);
    });

    it('should return isEligible as false when date returned for OverallWdfEligibility is before effectiveTime', async () => {
      const OverallWdfEligibility = new Date('2022-03-13T09:27:34.471Z');
      const effectiveTime = new Date('2022-05-13T09:27:34.471Z').getTime();
      sinon.stub(models.sequelize, 'query').returns(returnData(1, 4, OverallWdfEligibility));

      const wdf = await wdfData(establishmentId, effectiveTime);

      expect(wdf.isEligible).to.equal(false);
      expect(wdf.eligibilityDate).to.equal(OverallWdfEligibility);
    });

    it('should return isEligible as true when date returned for OverallWdfEligibility is after effectiveTime', async () => {
      const OverallWdfEligibility = new Date('2022-07-13T09:27:34.471Z');
      const effectiveTime = new Date('2022-06-13T09:27:34.471Z').getTime();
      sinon.stub(models.sequelize, 'query').returns(returnData(4, 4, OverallWdfEligibility));

      const wdf = await wdfData(establishmentId, effectiveTime);

      expect(wdf.isEligible).to.equal(true);
      expect(wdf.eligibilityDate).to.equal(OverallWdfEligibility);
    });

    describe('eligibilityPercentage', () => {
      it('should set percentage to 25 when 1 out of 4 workers completed', async () => {
        sinon.stub(models.sequelize, 'query').returns(returnData(1, 4));

        const wdf = await wdfData(establishmentId);

        expect(wdf.eligibilityPercentage).to.equal(25);
      });

      it('should set percentage to 50 when 5 out of 10 workers completed', async () => {
        sinon.stub(models.sequelize, 'query').returns(returnData(5, 10));

        const wdf = await wdfData(establishmentId);

        expect(wdf.eligibilityPercentage).to.equal(50);
      });

      it('should set percentage to 0 when worker count is 0', async () => {
        sinon.stub(models.sequelize, 'query').returns(returnData(0, 0));

        const wdf = await wdfData(establishmentId);

        expect(wdf.eligibilityPercentage).to.equal(0);
      });

      it('should set percentage to 100 when worker count is 9 and completed is 9', async () => {
        sinon.stub(models.sequelize, 'query').returns(returnData(9, 9));

        const wdf = await wdfData(establishmentId);

        expect(wdf.eligibilityPercentage).to.equal(100);
      });
    });
  });
});

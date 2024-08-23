const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { nhsBsaApi } = require('../../../../routes/nhsBsaApi/workplaceData');
const models = require('../../../../models');
const WdfCalculator = require('../../../../models/classes/wdfCalculator').WdfCalculator;

describe('server/routes/nhsBsaApi/workplaceData.js', () => {
  const workplaceId = 'J1001845';
  const request = {
    method: 'GET',
    url: `/api/v1/workplaces/${workplaceId}`,

    params: {
      workplaceId: workplaceId,
    },
  };
  let result;

  beforeEach(() => {
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
      overallWdfEligibility: new Date('2021-05-13T09:27:34.471Z'),
      mainService: {
        name: 'Domiciliary care services',
        category: 'Adult domiciliary',
      },
      workers: [],
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('nhsBsaApi', () => {
    it('should return 200 when workplace data successfully retrieved', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

      await nhsBsaApi(req, res);

      expect(res.statusCode).to.equal(200);
    });

    it('should return data from database call in expected format', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

      await nhsBsaApi(req, res);
      const response = res._getJSONData();

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

    it('should return subsidiaries as an array formatted in the same way as a standalone when is parent', async () => {
      result.isParent = true;

      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);
      sinon.stub(models.establishment, 'getNhsBsaApiDataForSubs').returns([result]);

      await nhsBsaApi(req, res);
      const response = res._getJSONData();

      expect(response.workplaceData.isParent).to.equal(true);
      expect(response.workplaceData.subsidiaries).to.deep.equal([
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
          eligibilityDate: '2021-05-13T09:27:34.471Z',
          isEligible: false,
        },
      ]);
    });

    it('should return parent data formatted in the same way as a standalone when workplace has parent ID', async () => {
      result.parentId = 'J1001845';

      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);
      sinon.stub(models.establishment, 'getNhsBsaApiDataForParent').returns(result);

      await nhsBsaApi(req, res);
      const response = res._getJSONData();

      expect(response.workplaceData.parentWorkplace).to.deep.equal({
        workplaceId: 'J1001845',
        workplaceName: 'SKILLS FOR CARE',
        dataOwner: 'Workplace',
        workplaceAddress: { firstLine: 'WEST GATE', town: 'LEEDS', postCode: 'LS1 2RP' },
        locationId: null,
        numberOfWorkplaceStaff: 2,
        serviceName: 'Domiciliary care services',
        serviceCategory: 'Adult domiciliary',
        eligibilityPercentage: 0,
        eligibilityDate: '2021-05-13T09:27:34.471Z',
        isEligible: false,
      });
    });

    it('should return 404 when workplace is not found', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(null);
      await nhsBsaApi(req, res);

      expect(res.statusCode).to.deep.equal(404);
      expect(res._getJSONData()).to.deep.equal({ error: 'Cannot find this Id.' });
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').throws();
      await nhsBsaApi(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    describe('eligibilityPercentage', () => {
      it('should set eligibilityPercentage to 0 when workers returned as null', async () => {
        result.workers = null;
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(0);
      });

      it('should set eligibilityPercentage to 0 when workers returned as empty array', async () => {
        result.workers = [];
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(0);
      });

      it('should set eligibilityPercentage to 0 when several workers returned but none have WdfEligible as true', async () => {
        result.workers = [{ get: () => false }, { get: () => false }, { get: () => false }];
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(0);
      });

      it('should set eligibilityPercentage to 100 when all workers returned have WdfEligible as true', async () => {
        result.workers = [{ get: () => true }, { get: () => true }, { get: () => true }];
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(100);
      });

      it('should set eligibilityPercentage to 25 when 1 out of 4 workers have WdfEligible as true', async () => {
        result.workers = [{ get: () => true }, { get: () => false }, { get: () => false }, { get: () => false }];
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(25);
      });

      it('should set percentage to 66 when 2 out of 3 workers have WdfEligible as true', async () => {
        result.workers = [{ get: () => true }, { get: () => true }, { get: () => false }];
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.eligibilityPercentage).to.equal(66);
      });
    });

    describe('isEligible', () => {
      it('should return isEligible as false when no date returned for OverallWdfEligibility', async () => {
        result.overallWdfEligibility = null;
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.isEligible).to.equal(false);
        expect(response.workplaceData.workplaceDetails.eligibilityDate).to.equal(null);
      });

      it('should return isEligible as false when date returned for OverallWdfEligibility is before effectiveTime', async () => {
        const overallWdfEligibility = '2022-03-13T09:27:34.471Z';
        result.overallWdfEligibility = new Date(overallWdfEligibility);
        WdfCalculator.effectiveDate = new Date('2022-05-13T09:27:34.471Z').getTime();
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.isEligible).to.equal(false);
        expect(response.workplaceData.workplaceDetails.eligibilityDate).to.equal(overallWdfEligibility);
      });

      it('should return isEligible as true when date returned for overallWdfEligibility is after effectiveTime', async () => {
        const overallWdfEligibility = '2022-07-13T09:27:34.471Z';
        result.overallWdfEligibility = new Date(overallWdfEligibility);

        WdfCalculator.effectiveDate = new Date('2022-06-13T09:27:34.471Z').getTime();
        sinon.stub(models.establishment, 'getNhsBsaApiDataByWorkplaceId').returns(result);

        await nhsBsaApi(req, res);
        const response = res._getJSONData();

        expect(response.workplaceData.workplaceDetails.isEligible).to.equal(true);
        expect(response.workplaceData.workplaceDetails.eligibilityDate).to.equal(overallWdfEligibility);
      });
    });
  });
});

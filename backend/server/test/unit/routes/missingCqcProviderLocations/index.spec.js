const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const moment = require('moment');
const models = require('../../../../models/index');
const CQCProviderDataAPI = require('../../../../utils/CQCProviderDataAPI');

const {
  missingCqcProviderLocations,
  getWeeksSinceParentApproval,
  getChildWorkplacesLocationIds,
  findMissingCqcLocationIds,
  checkMissingWorkplacesAndParentApprovalRule,
} = require('../../../../routes/missingCqcProviderLocations');

describe('server/routes/establishments/missingCqcProviderLocations', async () => {
  describe('get locationIDs', async () => {
    const locationId = '1-2003';

    const cqcLocationIds = ['1-12427547986', '1-2043158439', '1-5310224737'];

    beforeEach(() => {
      sinon.stub(CQCProviderDataAPI, 'getCQCProviderData').callsFake(async (locationID) => {
        return {
          providerId: locationId,
          locationIds: cqcLocationIds,
        };
      });
    });

    afterEach(async () => {
      sinon.restore();
    });

    const childWorkplaces = {
      count: 2,
      rows: [
        {
          uid: '23a455',
          NameValue: 'test 1',
          locationId: null,
        },
        {
          uid: '23dg5',
          NameValue: 'test 2',
          locationId: '1-123',
        },
        {
          uid: '43246f',
          NameValue: 'test 3',
          locationId: '1-53',
        },
      ],
    };

    it('should return a 200 status when call is successful', async () => {
      const request = {
        method: 'GET',
        url: `/api/missingCqcProviderLocations`,
        params: {
          locationID: 'locationId',
        },
        query: {
          establishmentUid: 'some-uuid',
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return false for showMissingCqcMessage and missingCqcLocations with an empty array if CQCProviderDataAPI has an error', async () => {
      const request = {
        method: 'GET',
        url: `/api/missingCqcProviderLocations`,
        params: {
          locationID: 'locationId',
        },
        query: {
          establishmentUid: 'some-uuid',
        },
      };

      sinon.restore();
      sinon.stub(CQCProviderDataAPI, 'getCQCProviderData').throws();

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 0,
        missingCqcLocations: {
          count: 0,
          missingCqcLocationIds: [],
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return ', async () => {
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });

      sinon.stub(models.establishment, 'getChildWorkplaces').returns(childWorkplaces);

      const request = {
        method: 'GET',
        url: `/api/missingCqcProviderLocations`,
        params: {
          locationID: 'locationId',
        },
        query: {
          establishmentUid: 'some-uuid',
        },
      };

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 3,
        missingCqcLocations: {
          count: 3,
          missingCqcLocationIds: cqcLocationIds,
        },
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return the difference in weeks', async () => {
      const parentApproval = {
        ID: 1,
        UUID: 'some-uuid',
        EstablishmentID: 105,
        Status: 'Approved',
        updatedAt: moment(moment().subtract(21, 'days')),
      };

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      expect(weeksSinceParentApproval).to.equal(3);
    });

    it('should return an array of child workplaces location ids', async () => {
      const expectedResult = ['1-123', '1-53'];
      const childWorkplacesLocationIds = await getChildWorkplacesLocationIds(childWorkplaces.rows);

      expect(childWorkplacesLocationIds).to.deep.equal(expectedResult);
    });

    it('should return an array of missing cqc child workplaces location ids and count', async () => {
      const cqcLocationIds = ['1-123', '1-53', '1-324'];
      const childWorkplacesLocationIds = ['1-123', '1-53'];

      const expectedResult = { count: 1, missingCqcLocationIds: ['1-324'] };

      const missingCqcLocationIds = await findMissingCqcLocationIds(cqcLocationIds, childWorkplacesLocationIds);

      expect(missingCqcLocationIds).to.deep.equal(expectedResult);
    });

    describe('checkMissingWorkplacesAndParentApprovalRule', () => {
      it('should return true', async () => {
        const weeksSinceParentApproval = 8;
        const missingCqcLocationsCount = 6;
        const showMissingCqcMessage = await checkMissingWorkplacesAndParentApprovalRule(
          weeksSinceParentApproval,
          missingCqcLocationsCount,
        );

        expect(showMissingCqcMessage).to.equal(true);
      });
      it('should return false', async () => {
        const weeksSinceParentApproval = 3;
        const missingCqcLocationsCount = 4;
        const showMissingCqcMessage = await checkMissingWorkplacesAndParentApprovalRule(
          weeksSinceParentApproval,
          missingCqcLocationsCount,
        );

        expect(showMissingCqcMessage).to.equal(false);
      });
    });
  });
});

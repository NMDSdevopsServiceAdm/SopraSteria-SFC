const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const moment = require('moment');
const models = require('../../../../models/index');
const CQCDataAPI = require('../../../../utils/CQCDataAPI');

const {
  missingCqcProviderLocations,
  getWeeksSinceParentApproval,
  getChildWorkplacesLocationIds,
  findMissingCqcLocationIds,
  hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval,
} = require('../../../../routes/missingCqcProviderLocations');

describe('server/routes/establishments/missingCqcProviderLocations', async () => {
  describe('get missingCqcProviderLocations', async () => {
    const provId = '1-2003';
    const cqcLocationIds = ['1-12427547986', '1-2043158439', '1-5310224737'];
    const locationsTableIds = ['1-12427547986', '1-2043158439', '1-5310224737'];

    let request;

    beforeEach(() => {
      sinon.stub(CQCDataAPI, 'getCQCProviderData').callsFake(async (locationProviderId) => {
        return {
          providerId: provId,
          locationIds: cqcLocationIds,
        };
      });

      request = {
        method: 'GET',
        url: `/api/missingCqcProviderLocations`,
        params: {},
        query: {
          provId: provId,
          establishmentUid: 'some-uuid',
          establishmentId: 2,
        },
      };
    });

    afterEach(async () => {
      sinon.restore();
    });

    const childWorkplaces = {
      count: 3,
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
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });

      await missingCqcProviderLocations(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return all data', async () => {
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });

      sinon.stub(models.establishment, 'getChildWorkplaces').returns(childWorkplaces);

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 3,
        missingCqcLocations: {
          count: 3,
          missingCqcLocationIds: cqcLocationIds,
        },
        childWorkplacesCount: 3,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return childWorkplaceCount and parent approval info with empty fields for CQC when no provId in query', async () => {
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });

      sinon.stub(models.establishment, 'getChildWorkplaces').returns(childWorkplaces);

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 3,
        missingCqcLocations: {
          count: 0,
          missingCqcLocationIds: [],
        },
        childWorkplacesCount: 3,
      };

      request.query.provId = null;

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return false for showMissingCqcMessage and missingCqcLocations with an empty array if CQCDataAPI has an error', async () => {
      sinon.restore();
      sinon.stub(models.establishment, 'getChildWorkplaces').returns(childWorkplaces);
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });

      sinon.stub(CQCDataAPI, 'getCQCProviderData').throws();

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 3,
        missingCqcLocations: {
          count: 0,
          missingCqcLocationIds: [],
        },
        childWorkplacesCount: 3,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return weeksSinceParentApproval as null and all fields set to empty values when is not parent', async () => {
      sinon.restore();
      sinon.stub(models.establishment, 'getChildWorkplaces').returns({ rows: [], count: 0 });
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns(null);
      sinon.stub(CQCDataAPI, 'getCQCProviderData').returns(null);

      request.locationId = null;

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: null,
        missingCqcLocations: {
          count: 0,
          missingCqcLocationIds: [],
        },
        childWorkplacesCount: 0,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return false for showMissingCqcMessage and missingCqcLocations with an empty array if invalid locationid format sent', async () => {
      const request = {
        method: 'GET',
        url: `/api/missingCqcProviderLocations`,
        query: {
          provId: '1-provId',
          establishmentUid: 'some-uuid',
          establishmentId: 2,
        },
      };

      sinon.restore();
      sinon.stub(models.establishment, 'getChildWorkplaces').returns(childWorkplaces);
      sinon.stub(models.Approvals, 'findbyEstablishmentId').returns({
        updatedAt: moment(moment().subtract(21, 'days')),
      });
      sinon.stub(CQCDataAPI, 'getCQCProviderData').callsFake(async (locationProviderId) => {
        return {};
      });

      const expectedResult = {
        showMissingCqcMessage: false,
        weeksSinceParentApproval: 3,
        missingCqcLocations: {
          count: 0,
          missingCqcLocationIds: [],
        },
        childWorkplacesCount: 3,
      };

      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await missingCqcProviderLocations(req, res);

      expect(res._getData()).to.deep.equal(expectedResult);
      expect(res.statusCode).to.deep.equal(200);
    });
  });

    it('should return an array of child workplaces location ids', async () => {
      const expectedResult = ['1-123', '1-53'];
      const childWorkplacesLocationIds = await getChildWorkplacesLocationIds(childWorkplaces.rows);

      expect(childWorkplacesLocationIds).to.deep.equal(expectedResult);
    });

  describe('findMissingCqcLocationsIds', async () => {
    setup = (overrides = {}) => {
      const provId = '1-2003';
      const childWorkplacesLocationIds = ['1-123', '1-53'];

      sinon.restore();
      sinon.stub(CQCDataAPI, 'getCQCProviderData').returns({ locationIds: overrides?.cqcLocationIds ??  ['1-123', '1-53', '1-324'] });

      sinon.stub(models.location, 'findMultipleByLocationID').returns(
        overrides?.locationTableIds ??
        [
          { locationid: '1-123' },
          { locationid: '1-53' },
          { locationid: '1-324' },
        ]
      );

      return {
        provId,
        childWorkplacesLocationIds
      }
    }

    it('should return an array of missing cqc child workplaces location ids and count', async () => {

      const { provId, childWorkplacesLocationIds } = setup();

      const expectedResult = { count: 1, missingCqcLocationIds: ['1-324'] };

      const missingCqcLocationIds = await findMissingCqcLocationIds(provId, childWorkplacesLocationIds);

      expect(missingCqcLocationIds).to.deep.equal(expectedResult);
    });

    it('should not count deregistered cqc child workplace locations', async () => {
      const { provId, childWorkplacesLocationIds } = setup({ cqcLocationIds: ['1-123', '1-53', '1-324', '1-DEREGISTERED'] });

      const expectedResult = { count: 1, missingCqcLocationIds: ['1-324'] };

      const missingCqcLocationIds = await findMissingCqcLocationIds(provId, childWorkplacesLocationIds);

      expect(missingCqcLocationIds).to.deep.equal(expectedResult);
    });
  });

  describe('getWeeksSinceParentApproval', () => {
    let parentApproval;
    beforeEach(() => {
      parentApproval = {
        ID: 1,
        UUID: 'some-uuid',
        EstablishmentID: 105,
        Status: 'Approved',
        updatedAt: moment(moment().subtract(21, 'days')),
      };
    });
    it('should return 3 when 21 days between updatedAt date and current date', async () => {
      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      expect(weeksSinceParentApproval).to.equal(3);
    });

    it('should return 0 when 6 days between updatedAt date and current date', async () => {
      parentApproval.updatedAt = moment(moment().subtract(6, 'days'));

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      expect(weeksSinceParentApproval).to.equal(0);
    });

    it('should return 1 when 13 days between updatedAt date and current date', async () => {
      parentApproval.updatedAt = moment(moment().subtract(13, 'days'));

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      expect(weeksSinceParentApproval).to.equal(1);
    });

    it('should return null when parentApproval is null', async () => {
      parentApproval = null;

      const weeksSinceParentApproval = await getWeeksSinceParentApproval(parentApproval);

      expect(weeksSinceParentApproval).to.equal(null);
    });
  });

  describe('hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval', () => {
    it('should return true if 8 weeks or more since parent approval and more than 5 missing CQC locations', async () => {
      const weeksSinceParentApproval = 8;
      const missingCqcLocationsCount = 6;
      const showMissingCqcMessage = await hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval(
        weeksSinceParentApproval,
        missingCqcLocationsCount,
      );

      expect(showMissingCqcMessage).to.equal(true);
    });

    it('should return false if under 8 weeks since parent approval', async () => {
      const weeksSinceParentApproval = 7;
      const missingCqcLocationsCount = 6;
      const showMissingCqcMessage = await hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval(
        weeksSinceParentApproval,
        missingCqcLocationsCount,
      );

      expect(showMissingCqcMessage).to.equal(false);
    });

    it('should return false if fewer than 6 missing CQC locations', async () => {
      const weeksSinceParentApproval = 12;
      const missingCqcLocationsCount = 5;
      const showMissingCqcMessage = await hasOver5MissingCqcLocationsAndOver8WeeksSinceApproval(
        weeksSinceParentApproval,
        missingCqcLocationsCount,
      );

      expect(showMissingCqcMessage).to.equal(false);
    });
  });
});

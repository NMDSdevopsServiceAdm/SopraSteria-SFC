const expect = require('chai').expect;
const sinon = require('sinon');

const { getProviderId } = require('../../../utils/cqcLocationUtils');
const cqcDataApi = require('../../../utils/CQCDataAPI');
const models = require('../../../models');

describe('backend/server/utils/cqcLocationUtils.js', () => {
  const mockProviderId = 'mock-provider-id';
  let stubFindByLocationID;
  let stubCQCApi;
  beforeEach(() => {
    stubFindByLocationID = sinon.stub(models.location, 'findByLocationID');
    stubUpdateProviderID = sinon.stub(models.location, 'updateProviderID');
    stubCQCApi = sinon.stub(cqcDataApi, 'getWorkplaceCQCData');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getProviderId', () => {
    it('should lookup the provider ID stored in location table', async () => {
      stubFindByLocationID.resolves({ providerid: mockProviderId });
      const locationId = '1-109009203';
      const actual = await getProviderId(locationId);

      expect(stubCQCApi).not.to.have.been.called;
      expect(actual).to.equal(mockProviderId);
    });

    it('should use the getWorkplaceCQCData function to get the provider ID if provider ID in location table is empty', async () => {
      stubFindByLocationID.resolves({ providerid: null });
      stubCQCApi.resolves({ providerId: 'provider-id-from-cqc-api' });

      const locationId = '1-109009203';
      const result = await getProviderId(locationId);

      expect(stubCQCApi).to.have.been.calledOnceWith(locationId);
      expect(result).to.equal('provider-id-from-cqc-api');
    });

    it('should use the getWorkplaceCQCData function to get the provider ID if cannot find the location record from location table', async () => {
      stubFindByLocationID.resolves(null);
      stubCQCApi.resolves({ providerId: 'provider-id-from-cqc-api' });

      const locationId = '1-109009203';
      const result = await getProviderId(locationId);

      expect(stubCQCApi).to.have.been.calledOnceWith(locationId);
      expect(result).to.equal('provider-id-from-cqc-api');
    });

    it('should update the location table if it fetched an updated provider ID from CQC API', async () => {
      stubFindByLocationID.resolves(null);
      stubCQCApi.resolves({ providerId: 'provider-id-from-cqc-api' });

      const locationId = '1-109009203';
      await getProviderId(locationId);

      expect(stubUpdateProviderID).to.have.been.calledOnceWith(locationId, 'provider-id-from-cqc-api');
    });

    it('should not call the CQC API if no location ID was given', async () => {
      const result = await getProviderId(null);

      expect(stubCQCApi).not.to.have.been.called;
      expect(result).to.equal(null);
    });

    it('should return null if both the location table and the CQC API does not have the provider ID', async () => {
      stubFindByLocationID.resolves(null);
      stubCQCApi.resolves({});

      const locationId = '1-109009203';
      const result = await getProviderId(locationId);

      expect(result).to.equal(null);
    });

    it('should return null if the API call failed', async () => {
      stubFindByLocationID.resolves(null);
      stubCQCApi.rejects(new Error('404 not found'));
      sinon.stub(console, 'error'); // suppress noisy error msg

      const result = await getProviderId('invalid-location-id');
      expect(result).to.equal(null);
    });
  });
});

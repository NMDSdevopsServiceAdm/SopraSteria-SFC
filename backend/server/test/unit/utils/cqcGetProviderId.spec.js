const expect = require('chai').expect;
const sinon = require('sinon');

const { getProviderId } = require('../../../../server/utils/cqcGetProviderId');
const cqcDataApi = require('../../../../server/utils/CQCDataAPI');

describe.only('backend/server/utils/cqcGetProviderId.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getProviderId', () => {
    it('should use the getWorkplaceCQCData function to get the provider ID of a workplace', async () => {
      const apiResponseData = { providerId: '123' };
      const cqcAPIStub = sinon.stub(cqcDataApi, 'getWorkplaceCQCData').returns(apiResponseData);

      const locationId = '1-109009203';
      const result = await getProviderId(locationId);

      expect(cqcAPIStub).to.have.been.calledOnceWith(locationId);
      expect(result).to.equal('123');
    });

    it('should return null if there is no provider ID in CQC API response', async () => {
      const apiResponseData = { someUnrelatedData: 'mock data' };
      sinon.stub(cqcDataApi, 'getWorkplaceCQCData').returns(apiResponseData);

      const locationId = '1-109009203';
      const result = await getProviderId(locationId);

      expect(result).to.equal(null);
    });

    it('should not call the API if no location ID was given', async () => {
      const cqcAPIStub = sinon.stub(cqcDataApi, 'getWorkplaceCQCData');

      const result = await getProviderId(null);

      expect(cqcAPIStub).not.to.have.been.called;
      expect(result).to.equal(null);
    });

    it('should return null if the API call failed', async () => {
      sinon.stub(cqcDataApi, 'getWorkplaceCQCData').throws('401 unauthorised');

      const result = await getProviderId(null);
      expect(result).to.equal(null);
    });
  });
});

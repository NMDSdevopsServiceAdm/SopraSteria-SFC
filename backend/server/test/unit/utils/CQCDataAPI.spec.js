const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const config = require('../../../config/config.js');

const { getWorkplaceCQCData, getCQCProviderData } = require('../../../../server/utils/CQCDataAPI');

describe('server/utils/CQCDataAPI', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('getWorkplaceCQCData', () => {
    const url = 'https://api.service.cqc.org.uk/public/v1/locations/';

    const locationId = '1-109009203';

    it('should call the CQC API with CQC subscription key as header', async () => {
      const cqcAPIStub = sinon.stub(axios, 'get').returns({ data: true });
      const cqcSubscriptionKey = config.get('cqcApi.subscriptionKey');

      await getWorkplaceCQCData(locationId);

      expect(
        cqcAPIStub.calledOnceWith(url + locationId, { headers: { 'Ocp-Apim-Subscription-Key': cqcSubscriptionKey } }),
      ).to.equal(true);
    });
  });

  describe('getCQCProviderData', () => {
    const url = 'https://api.service.cqc.org.uk/public/v1/providers/';

    it('should call the CQC Providers API', async () => {
      const locationId = '1-1090003';
      const cqcProviderAPIStub = sinon.stub(axios, 'get').returns({ data: { providerId: locationId } });
      const cqcSubscriptionKey = config.get('cqcApi.subscriptionKey');

      await getCQCProviderData(locationId);

      expect(
        cqcProviderAPIStub.calledOnceWith(url + locationId, {
          headers: { 'Ocp-Apim-Subscription-Key': cqcSubscriptionKey },
        }),
      ).to.equal(true);
    });

    it('should return an empty object when invalid location ID passed in', async () => {
      const locationId = 'dasr';
      const cqcProviderAPIStub = sinon.stub(axios, 'get');

      await getCQCProviderData('dasr');

      expect(cqcProviderAPIStub.neverCalledWith(url + locationId)).to.equal(true);
    });
  });
});

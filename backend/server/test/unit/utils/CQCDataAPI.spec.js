const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const config = require('../../../config/config.js');

const { getWorkplaceCQCData } = require('../../../../server/utils/CQCDataAPI');

describe('server/utils/CQCDataAPI', async () => {
  afterEach(async () => {
    sinon.restore();
  });

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

const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');

const { getCQCProviderData } = require('../../../utils/CQCProviderDataAPI');

describe('server/utils/getCQCProviderData', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  const url = 'https://api.cqc.org.uk/public/v1/providers/';

  const locationId = '1-109009203';

  it('should call the CQC Providers API', async () => {
    const cqcProviderAPIStub = sinon.stub(axios, 'get').returns({ data: { providerId: locationId } });

    await getCQCProviderData(locationId);

    expect(cqcProviderAPIStub.calledOnceWith(url + locationId + '?partnerCode=SkillsForCare')).to.equal(true);
  });
});

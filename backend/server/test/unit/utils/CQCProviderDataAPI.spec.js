const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');

const { getCQCProviderData } = require('../../../utils/CQCProviderDataAPI');

describe('server/utils/getCQCProviderData', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  const url = 'https://api.cqc.org.uk/public/v1/providers/';

  it('should call the CQC Providers API', async () => {
    const locationId = '1-1090003';
    const cqcProviderAPIStub = sinon.stub(axios, 'get').returns({ data: { providerId: locationId } });

    await getCQCProviderData(locationId);

    expect(cqcProviderAPIStub.calledOnceWith(url + locationId + '?partnerCode=SkillsForCare')).to.equal(true);
  });

  it('should return an empty object', async () => {
    const locationId = 'dasr';
    const cqcProviderAPIStub = sinon.stub(axios, 'get');

    await getCQCProviderData('dasr');

    expect(cqcProviderAPIStub.neverCalledWith(url + locationId + '?partnerCode=SkillsForCare')).to.equal(true);
  });
});

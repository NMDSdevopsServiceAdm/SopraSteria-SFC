const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');

const { getWorkplaceCQCData } = require('../../../../server/utils/CQCDataAPI');

describe('server/utils/CQCDataAPI', async () => {
  afterEach(async () => {
    sinon.restore();
  });

  const url = 'https://api.cqc.org.uk/public/v1/locations/';

  const locationId = '1-109009203';

  it('should call the CQC API', async () => {
    const cqcAPIStub = sinon.stub(axios, 'get').returns({ data: true });

    await getWorkplaceCQCData(locationId);

    expect(cqcAPIStub.calledOnceWith(url + locationId + '?partnerCode=SkillsForCare')).to.equal(true);
  });
});

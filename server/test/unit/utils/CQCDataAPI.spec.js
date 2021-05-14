const expect = require('chai').expect;
const sinon = require('sinon');
const sinon_sandbox = sinon.createSandbox();
const axios = require('axios');

const { getWorkplaceCQCData } = require('../../../../server/utils/CQCDataAPI');

describe('server/utils/CQCDataAPI', async () => {
  afterEach(async () => {
    sinon_sandbox.restore();
  });

  const url = 'https://api.cqc.org.uk/public/v1/locations/';

  const locationId = '1-109009203';

  const cqcAPIStub = sinon_sandbox.stub(axios, 'get').returns({ data: true });

  it('should call the CQC API', async () => {
    await getWorkplaceCQCData(locationId);

    expect(cqcAPIStub.calledOnceWith(url + locationId)).to.be.true;
  });
});

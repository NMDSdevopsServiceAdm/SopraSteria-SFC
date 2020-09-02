const expect = require('chai').expect;
const sinon = require('sinon');

const getAddressAPI = require('../../../utils/getAddressAPI');

describe('fileLock util', () => {
  it("should return the correct data from API", async () => {
    const data = await getAddressAPI.getAddressAPI.getPostcodeData("M46FW");
    expect(data.addresses[0].district).to.equal("Manchester");
  });

});

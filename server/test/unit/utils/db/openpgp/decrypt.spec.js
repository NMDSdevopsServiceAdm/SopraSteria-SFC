const expect = require('chai').expect;
const encrypt = require('../../../../../utils/db/openpgp/encrypt').encrypt;
const decrypt = require('../../../../../utils/db/openpgp/decrypt').decrypt;

describe('Decrypt', () => {
  it('should encrypt and decrypt', async () => {
    const encrypted = await encrypt("hello moto");
    expect( await decrypt(encrypted)).to.equal("hello moto");
  });
});

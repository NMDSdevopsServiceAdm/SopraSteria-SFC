const expect = require('chai').expect;
const encrypt = require('../../../../../utils/db/openpgp/encrypt').encrypt;

describe('Encrypt', () => {

  it('should return an armoured response', async () => {
    const encrypted = await encrypt("hello moto");
    expect( encrypted).to.contain("-BEGIN PGP MESSAGE---");
  });
  it('should not contain the private data', async () => {
    const encrypted = await encrypt("hello moto");
    expect( encrypted).to.not.contain("hello moto");
  });
});

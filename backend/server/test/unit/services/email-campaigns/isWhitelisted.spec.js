const expect = require('chai').expect;
const sinon = require('sinon');

const { isWhitelisted } = require('../../../../services/email-campaigns/isWhitelisted');
const config = require('../../../../config/config');

describe('isWhitelisted', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return true if there is no whitelist', () => {
    sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('');

    const whitelisted = isWhitelisted('test@test.com');

    expect(whitelisted).to.equal(true);
  });

  it('should return true if the email is whitelisted', () => {
    sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

    const whitelisted = isWhitelisted('test@test.com');

    expect(whitelisted).to.equal(true);
  });

  it('should return false if the email is not whitelisted', () => {
    sinon.stub(config, 'get').withArgs('sendInBlue.whitelist').returns('test@test.com,name@name.com');

    const whitelisted = isWhitelisted('example@example.com');

    expect(whitelisted).to.equal(false);
  });
});

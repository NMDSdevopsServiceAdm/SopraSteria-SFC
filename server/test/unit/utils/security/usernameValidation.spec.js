const chai = require('chai');
const expect = chai.expect;

const { isUsernameValid } = require('../../../../utils/security/usernameValidation');

describe('isUsernameValid', () => {
  it('should return false if the username contains non valid punctuation', () => {
    const result = isUsernameValid('userName!');

    expect(result).to.equal(false);
  });

  it('should return true if the username is only text and numbers', () => {
    const result = isUsernameValid('userName012');

    expect(result).to.equal(true);
  });

  it('should return true if the username has underscore and is valid', () => {
    const result = isUsernameValid('userName012_');

    expect(result).to.equal(true);
  });

  it('should return true if the username has hyphen and is valid', () => {
    const result = isUsernameValid('userName012-');

    expect(result).to.equal(true);
  });

  it('should return true if the username has multiple hyphens and underscores and is valid', () => {
    const result = isUsernameValid('userName012-_-_');

    expect(result).to.equal(true);
  });
});

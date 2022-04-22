const chai = require('chai');
const expect = chai.expect;

const { isPasswordValid } = require('../../../../utils/security/passwordValidation');

describe('isPasswordValid', () => {
  it('should return false if the password is less than 8 chars', () => {
    const result = isPasswordValid('invalid');

    expect(result).to.equal(false);
  });

  it('should return false if the password has no uppercase letters', () => {
    const result = isPasswordValid('nouppercase');

    expect(result).to.equal(false);
  });

  it('should return false if the password has no lowercase letters', () => {
    const result = isPasswordValid('ALLUPPERCASE');

    expect(result).to.equal(false);
  });

  it('should return false if the password has no numbers', () => {
    const result = isPasswordValid('noNumbers');

    expect(result).to.equal(false);
  });

  it('should return false if password is empty string', () => {
    const result = isPasswordValid('');

    expect(result).to.equal(false);
  });

  it('should return false if password is undefined', () => {
    const result = isPasswordValid(undefined);

    expect(result).to.equal(false);
  });

  it('should return true if password is valid', () => {
    const result = isPasswordValid('imValidPassword1!');

    expect(result).to.equal(true);
  });
});

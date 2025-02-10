const expect = require('chai').expect;

const concatenateAddress = require('../../../utils/concatenateAddress').concatenateAddress;

describe('concatenateAddress', () => {
  it('should only return address line 1 when only line 1 passed in', () => {
    expect(concatenateAddress('Test Address Line 1')).to.equal('Test Address Line 1');
  });

  it('should concatenate all lines with spaces between when all provided', () => {
    expect(concatenateAddress('A', 'B', 'C', 'D', 'E')).to.equal('A B C D E');
  });

  it('should concatenate with single spaces between when address lines 2 and 3 are missing but town and county exist', () => {
    expect(concatenateAddress('A', undefined, undefined, 'D', 'E')).to.equal('A D E');
  });
});

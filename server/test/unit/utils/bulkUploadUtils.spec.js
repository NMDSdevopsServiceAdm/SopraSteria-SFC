const expect = require('chai').expect;

const dateFormatter = require('../../../utils/bulkUploadUtils').dateFormatter;

describe('dateFormatter', () => {
  it('should return the date correctly formatted when a date is passed', () => {
    expect(dateFormatter('1998-02-03')).to.equal('03/02/1998');
  });
  it('should return am empty string if no date is given', () => {
    expect(dateFormatter(null)).to.equal('');
  });
  it('should return an empty string if an empty string is given', () => {
    expect(dateFormatter('')).to.equal('');
  });
});

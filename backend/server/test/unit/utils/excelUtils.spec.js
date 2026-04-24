const { parseRange } = require('../../../utils/excelUtils');

const expect = require('chai').expect;

describe('excelUtils', () => {
  describe('parseRange', () => {
    it('should parse a excel range input to its columns and rows reference', () => {
      const input = 'A1:D3';
      const expected = { columns: ['A', 'B', 'C', 'D'], rows: [1, 2, 3] };
      const actual = parseRange(input);

      expect(actual).to.deep.equal(expected);
    });

    it('should handle columns with more than one char correctly', () => {
      const input = 'X3:AC4';
      const expected = { columns: ['X', 'Y', 'Z', 'AA', 'AB', 'AC'], rows: [3, 4] };
      const actual = parseRange(input);

      expect(actual).to.deep.equal(expected);
    });
  });
});

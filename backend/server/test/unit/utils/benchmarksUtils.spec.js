const expect = require('chai').expect;

const calculateRankDesc = require('../../../utils/benchmarksUtils').calculateRankDesc;
const calculateRankAsc = require('../../../utils/benchmarksUtils').calculateRankAsc;

describe('calculateRank', () => {
  describe('descending', () => {
    it('should be 1 when no other scores', () => {
      expect(calculateRankDesc(5, [])).to.equal(1);
    });

    it('should be null when no score', () => {
      expect(calculateRankDesc(null, [2, 3, 4])).to.equal(null);
    });

    it('should be 1 when higher than other scores', () => {
      expect(calculateRankDesc(5, [2, 3, 4])).to.equal(1);
    });

    it('should be total number of scores when lower than other scores', () => {
      expect(calculateRankDesc(1, [2, 3, 4])).to.equal(4);
    });

    it('should rank score according to other scores', () => {
      expect(calculateRankDesc(2, [1, 3, 4])).to.equal(3);
    });

    it('should joint rank score with matching other scores', () => {
      expect(calculateRankDesc(3, [1, 3, 4])).to.equal(2);
    });

    it('should skip rank score is below a joint rank', () => {
      expect(calculateRankDesc(2, [1, 5, 5, 4, 3, 3])).to.equal(6);
    });
  });

  describe('ascending', () => {
    it('should be 1 when no other scores', () => {
      expect(calculateRankAsc(5, [])).to.equal(1);
    });

    it('should be null when no score', () => {
      expect(calculateRankAsc(null, [2, 3, 4])).to.equal(null);
    });

    it('should be 1 when lower than other scores', () => {
      expect(calculateRankAsc(1, [2, 3, 4])).to.equal(1);
    });

    it('should be total number of scores when higher than other scores', () => {
      expect(calculateRankAsc(5, [2, 3, 4])).to.equal(4);
    });

    it('should rank score according to other scores', () => {
      expect(calculateRankAsc(2, [1, 3, 4])).to.equal(2);
    });

    it('should joint rank score with matching other scores', () => {
      expect(calculateRankAsc(3, [1, 3, 4])).to.equal(2);
    });

    it('should skip rank score is below a joint rank', () => {
      expect(calculateRankAsc(4, [1, 5, 5, 4, 3, 3])).to.equal(4);
    });
  });
});

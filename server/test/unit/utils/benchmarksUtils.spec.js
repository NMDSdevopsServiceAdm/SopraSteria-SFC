const expect = require('chai').expect;

const calculateRank = require('../../../utils/benchmarksUtils').calculateRank;

describe('calculateRank', () => {
  it('should be 1 when no other scores', () => {
    expect(calculateRank(5, [])).to.equal(1);
  })

  it('should be null when no score', () => {
    expect(calculateRank(null, [2, 3, 4])).to.equal(null);
  })

  it('should be 1 when higher than other scores', () => {
    expect(calculateRank(5, [2, 3, 4])).to.equal(1);
  })

  it('should be total number of scores when lower than other scores', () => {
    expect(calculateRank(1, [2, 3, 4])).to.equal(4);
  })

  it('should rank score according to other scores', () => {
    expect(calculateRank(2, [1, 3, 4])).to.equal(3);
  })

  it('should joint rank score with matching other scores', () => {
    expect(calculateRank(3, [1, 3, 4])).to.equal(2);
  })

  it('should skip rank score is below a joint rank', () => {
    expect(calculateRank(2, [1, 5, 5, 4, 3, 3])).to.equal(6);
  })
})

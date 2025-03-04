const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const models = require('../../../../../../models');
const { getComparisonGroupRankings } = require('../../../../../../routes/v2/establishments/benchmarks/benchmarksService');

describe('getComparisonGroupRankings', async () => {
  it('returns empty array when cssr not provided', async () => {
    testData = {};

    const result = await getComparisonGroupRankings(testData);

    expect(result).to.be.an('array');
    expect(result.length).to.equal(0);
  });

  it('returns benchmarks from provided benchmarks model', async () => {
    const mockResponse = [{ LocalAuthorityArea: 'test', MainServiceFK: 1, CssrID: 2 }];

    const stubBenchmarksModel = sinon.stub(models.benchmarksPay, 'findAll').callsFake(() => {
      return mockResponse;
    });

    testData = {
      benchmarksModel: models.benchmarksPay,
      establishmentId: 1,
      mainService: 1,
      attributes: ['Attribute 1', 'Attribute 2'],
      cssr: {id: 1}
    };

    const result = await getComparisonGroupRankings(testData);

    expect(stubBenchmarksModel).to.be.calledOnce;
    expect(result).to.equal(mockResponse);
  })
})
const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const rankings = require('../../../../../routes/establishments/benchmarks/rankings');

describe('rankings', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('pay', () => {
    it('should be response with stateMessage no-data when no comparison group data', async () => {
      const establishmentId = 123;

      sinon.stub(models.worker,'averageHourlyPay').returns({ amount: 15.00 })
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    })

    it('should be response with stateMessage no-pay when workplace has no pay data', async () => {
      const establishmentId = 123;

      sinon.stub(models.worker,'averageHourlyPay').returns({ amount: null })
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-data');
    })

    it('should be response with hasValue true when pay and comparison group are available', async () => {
      const establishmentId = 123;

      sinon.stub(models.worker,'averageHourlyPay').returns({ amount: 15.00 })
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.hasValue).to.equal(true);
    })

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      const establishmentId = 123;

      sinon.stub(models.worker,'averageHourlyPay').returns({ amount: 15.00 })
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 }
      ]);

      const result = await rankings.pay(establishmentId);

      expect(result.maxRank).to.equal(3);
    })

    it('should be response with currentRank against comparison group rankings', async () => {
      const establishmentId = 123;

      sinon.stub(models.worker,'averageHourlyPay').returns({ amount: 15.00 })
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 }
      ]);

      const result = await rankings.pay(establishmentId);

      expect(result.currentRank).to.equal(2);
    })
  })
});

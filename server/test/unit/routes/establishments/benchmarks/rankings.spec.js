const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const rankings = require('../../../../../routes/establishments/benchmarks/rankings');

describe('rankings', () => {
  afterEach(() => {
    sinon.restore();
  });

  const establishmentId = 123;

  describe('pay', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-data when workplace has no pay data', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: null });
      sinon
        .stub(models.benchmarksPay, 'getComparisonGroupRankings')
        .returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-data');
    });

    it('should be response with hasValue true when pay and comparison group are available', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon
        .stub(models.benchmarksPay, 'getComparisonGroupRankings')
        .returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 },
      ]);

      const result = await rankings.pay(establishmentId);

      expect(result.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 },
      ]);

      const result = await rankings.pay(establishmentId);

      expect(result.currentRank).to.equal(2);
    });
  });

  describe('turnover', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-workers when workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-workers');
    });

    it('should be response with stateMessage no-workers when staff count does not match workplace', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-workers');
    });

    it('should be response with stateMessage no-leavers when workplace has no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-leavers');
    });

    it('should be response with stateMessage no-perm-or-temp when workplace has no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should be response with stateMessage check-data when turnover is too high', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(10);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('check-data');
    });

    it('should be response with hasValue true when turnover and comparison group are available', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnover, 'getComparisonGroupRankings').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.currentRank).to.equal(2);
    });
  });
});

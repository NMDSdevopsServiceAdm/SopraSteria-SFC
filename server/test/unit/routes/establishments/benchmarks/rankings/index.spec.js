const models = require('../../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const rankings = require('../../../../../../routes/establishments/benchmarks/rankings');

describe('rankings', () => {
  beforeEach(() => {
    sinon.stub(models.cssr, 'getCSSR').returns(1);
  });

  afterEach(() => {
    sinon.restore();
  });

  const establishmentId = 123;

  describe('pay', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'findAll').returns([]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-pay-data when workplace has no pay data', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: null });
      sinon
        .stub(models.benchmarksPay, 'findAll')
        .returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.stateMessage).to.equal('no-pay-data');
    });

    it('should be response with hasValue true when pay and comparison group are available', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon
        .stub(models.benchmarksPay, 'findAll')
        .returns([{ CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId);

      expect(result.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 },
      ]);

      const result = await rankings.pay(establishmentId);

      expect(result.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPay, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, pay: 1400, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, pay: 1600, EstablishmentFK: 789 },
      ]);

      const result = await rankings.pay(establishmentId);
      expect(result.currentRank).to.equal(2);
    });
  });

  describe('qualifications', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.benchmarksQualifications, 'findAll').returns([]);

      const result = await rankings.qualifications(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-qualifications-data when workplace has no qualifications data', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 0, noQuals: 0, lvl2Quals: 0 });

      sinon.stub(models.benchmarksQualifications, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId);

      expect(result.stateMessage).to.equal('no-qualifications-data');
    });

    it('should be response with hasValue true when qualifications and comparison group are available', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });
      sinon.stub(models.benchmarksQualifications, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId);

      expect(result.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });
      sinon.stub(models.benchmarksQualifications, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId);

      expect(result.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });

      sinon.stub(models.benchmarksQualifications, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, qualifications: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId);

      expect(result.currentRank).to.equal(2);
    });
  });

  describe('sickness', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.benchmarksSickness, 'findAll').returns([]);

      const result = await rankings.sickness(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-sickness-data when workplace has no sickness data', async () => {
      sinon.stub(models.establishment, 'workers').returns(null);

      sinon.stub(models.benchmarksSickness, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, sickness: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, sickness: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId);

      expect(result.stateMessage).to.equal('no-sickness-data');
    });

    it('should be response with hasValue true when sickness and comparison group are available', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSickness, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, sickness: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, sickness: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId);

      expect(result.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSickness, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, sickness: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, sickness: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId);

      expect(result.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSickness, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, sickness: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, sickness: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId);

      expect(result.currentRank).to.equal(2);
    });
  });

  describe('turnover', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage mismatch-workers when workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage mismatch-workers when staff count does not match workplace', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage no-leavers when workplace has no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
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
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should be response with stateMessage incorrect-turnover when turnover is too high', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(10);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.stateMessage).to.equal('incorrect-turnover');
    });

    it('should be response with hasValue true when turnover and comparison group are available', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
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
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
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
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.currentRank).to.equal(2);
    });

    it('should be response with currentRank 1 when leavers value is 0', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnover, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, turnover: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, turnover: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId);

      expect(result.currentRank).to.equal(1);
    });
  });
});

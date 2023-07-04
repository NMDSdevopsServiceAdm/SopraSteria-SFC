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
      sinon.stub(models.benchmarksPayByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksPayByEstIdGoodOutstanding, 'findAll').returns([]);

      const result = await rankings.pay(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-pay-data when workplace has no pay data', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: null });
      sinon
        .stub(models.benchmarksPayByEstId, 'findAll')
        .returns([{ LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 456 }]);

      sinon
        .stub(models.benchmarksPayByEstIdGoodOutstanding, 'findAll')
        .returns([{ LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1550, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-pay-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-pay-data');
    });

    it('should be response with hasValue true when pay and comparison group are available', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon
        .stub(models.benchmarksPayByEstId, 'findAll')
        .returns([{ LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 456 }]);

      sinon
        .stub(models.benchmarksPayByEstIdGoodOutstanding, 'findAll')
        .returns([{ LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1550, EstablishmentFK: 456 }]);

      const result = await rankings.pay(establishmentId, 8, 10);

      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPayByEstId, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1600, EstablishmentFK: 456 },
      ]);

      sinon.stub(models.benchmarksPayByEstIdGoodOutstanding, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1550, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 400 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1700, EstablishmentFK: 550 },
      ]);

      const result = await rankings.pay(establishmentId, 8, 10);

      expect(result.groupRankings.maxRank).to.equal(3);
      expect(result.goodCqcRankings.maxRank).to.equal(4);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });
      sinon.stub(models.benchmarksPayByEstId, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1600, EstablishmentFK: 456 },
      ]);

      sinon.stub(models.benchmarksPayByEstIdGoodOutstanding, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1550, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1400, EstablishmentFK: 400 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, AverageHourlyRate: 1700, EstablishmentFK: 550 },
      ]);

      const result = await rankings.pay(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(2);
      expect(result.goodCqcRankings.currentRank).to.equal(3);
    });
  });

  describe('qualifications', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 0, noQuals: 0, lvl2Quals: 0 });
      sinon.stub(models.benchmarksQualificationsByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksQualificationsByEstIdGoodOutstanding, 'findAll').returns([]);

      const result = await rankings.qualifications(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-qualifications-data when workplace has no qualifications data', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 0, noQuals: 0, lvl2Quals: 0 });

      sinon.stub(models.benchmarksQualificationsByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksQualificationsByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.1, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-qualifications-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-qualifications-data');
    });

    it('should be response with hasValue true when qualifications and comparison group are available', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });
      sinon.stub(models.benchmarksQualificationsByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksQualificationsByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.1, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId, 8, 10);
      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });
      sinon.stub(models.benchmarksQualificationsByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.6, EstablishmentFK: 620 },
      ]);
      sinon.stub(models.benchmarksQualificationsByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.1, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId, 8, 10);
      expect(result.groupRankings.maxRank).to.equal(4);
      expect(result.goodCqcRankings.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });

      sinon.stub(models.benchmarksQualificationsByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksQualificationsByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.1, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, Qualifications: 0.7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.qualifications(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(2);
      expect(result.goodCqcRankings.currentRank).to.equal(2);
    });
  });

  describe('sickness', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.establishment, 'workers').returns(null);
      sinon.stub(models.benchmarksSicknessByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksSicknessByEstIdGoodOutstanding, 'findAll').returns([]);

      const result = await rankings.sickness(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-sickness-data when workplace has no sickness data', async () => {
      sinon.stub(models.establishment, 'workers').returns(null);

      sinon.stub(models.benchmarksSicknessByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      sinon.stub(models.benchmarksSicknessByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-sickness-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-sickness-data');
    });

    it('should be response with hasValue true when sickness and comparison group are available', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSicknessByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      sinon.stub(models.benchmarksSicknessByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId, 8, 10);

      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSicknessByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 9, EstablishmentFK: 800 },
      ]);

      sinon.stub(models.benchmarksSicknessByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId, 8, 10);

      expect(result.groupRankings.maxRank).to.equal(4);
      expect(result.goodCqcRankings.maxRank).to.equal(3);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });
      sinon.stub(models.benchmarksSicknessByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 9, EstablishmentFK: 800 },
      ]);

      sinon.stub(models.benchmarksSicknessByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 3, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, AverageNoOfSickDays: 7, EstablishmentFK: 789 },
      ]);

      const result = await rankings.sickness(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(2);
      expect(result.goodCqcRankings.currentRank).to.equal(2);
    });
  });

  describe('turnover', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage mismatch-workers when workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);
      expect(result.groupRankings.stateMessage).to.equal('mismatch-workers');
      expect(result.goodCqcRankings.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage mismatch-workers when staff count does not match workplace', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('mismatch-workers');
      expect(result.goodCqcRankings.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage no-leavers when workplace has no leavers', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);
      expect(result.groupRankings.stateMessage).to.equal('no-leavers');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-leavers');
    });

    it('should be response with stateMessage no-perm-or-temp when workplace has no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-perm-or-temp');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should be response with stateMessage incorrect-turnover when turnover is too high', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(10);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('incorrect-turnover');
      expect(result.goodCqcRankings.stateMessage).to.equal('incorrect-turnover');
    });

    it('should be response with hasValue true when turnover and comparison group are available', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.maxRank).to.equal(3);
      expect(result.goodCqcRankings.maxRank).to.equal(5);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.8, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(2);
      expect(result.goodCqcRankings.currentRank).to.equal(4);
    });

    it('should be response with currentRank 1 when leavers value is 0', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksTurnoverByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksTurnoverByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, TurnoverRate: 0.8, EstablishmentFK: 789 },
      ]);

      const result = await rankings.turnover(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(3);
      expect(result.goodCqcRankings.currentRank).to.equal(5);
    });
  });

  describe('vacancy', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage mismatch-workers when workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);
      expect(result.groupRankings.stateMessage).to.equal('mismatch-workers');
      expect(result.goodCqcRankings.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage mismatch-workers when staff count does not match workplace', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('mismatch-workers');
      expect(result.goodCqcRankings.stateMessage).to.equal('mismatch-workers');
    });

    it('should be response with stateMessage no-vacancies when workplace has no vacancies', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-vacancies');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-vacancies');
    });

    it('should be response with hasValue true when vacancies and comparison group are available', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, VacanciesValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 10, VacanciesValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.maxRank).to.equal(3);
      expect(result.goodCqcRankings.maxRank).to.equal(5);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, LeaversValue: 'With Jobs', VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(3);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.8, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(2);
      expect(result.goodCqcRankings.currentRank).to.equal(4);
    });

    it('should be response with currentRank when vacancies value is 0', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, VacanciesValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);
      sinon.stub(models.benchmarksVacanciesByEstId, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
      ]);
      sinon.stub(models.benchmarksVacanciesByEstIdGoodOutstanding, 'findAll').returns([
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.4, EstablishmentFK: 456 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.6, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.7, EstablishmentFK: 789 },
        { CssrID: 123, MainServiceFK: 1, VacancyRate: 0.8, EstablishmentFK: 789 },
      ]);

      const result = await rankings.vacancy(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(3);
      expect(result.goodCqcRankings.currentRank).to.equal(5);
    });
  });

  describe('time in role', () => {
    it('should be response with stateMessage no-comparison-data when no comparison group data', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns({ amount: 3 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns({ amount: 3 });
      sinon.stub(models.benchmarksTimeInRoleByEstId, 'findAll').returns([]);
      sinon.stub(models.benchmarksTimeInRoleByEstIdGoodOutstanding, 'findAll').returns([]);
      sinon.stub(models.worker, 'countForEstablishment').returns(6);

      const result = await rankings.timeInRole(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-comparison-data');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-comparison-data');
    });

    it('should be response with stateMessage no-perm-or-temp when workplace has no perm or temp data', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns({ amount: 0 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(null);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 6, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(6);
      sinon
        .stub(models.benchmarksTimeInRoleByEstId, 'findAll')
        .returns([
          { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1400, EstablishmentFK: 456 },
        ]);

      sinon
        .stub(models.benchmarksTimeInRoleByEstIdGoodOutstanding, 'findAll')
        .returns([
          { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1550, EstablishmentFK: 456 },
        ]);

      const result = await rankings.timeInRole(establishmentId, 8, 10);

      expect(result.groupRankings.stateMessage).to.equal('no-perm-or-temp');
      expect(result.goodCqcRankings.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should be response with hasValue true when pay and comparison group are available', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns({ amount: 3 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns({ amount: 3 });
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 6, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(6);
      sinon
        .stub(models.benchmarksTimeInRoleByEstId, 'findAll')
        .returns([
          { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1400, EstablishmentFK: 456 },
        ]);

      sinon
        .stub(models.benchmarksTimeInRoleByEstIdGoodOutstanding, 'findAll')
        .returns([
          { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1550, EstablishmentFK: 456 },
        ]);

      const result = await rankings.timeInRole(establishmentId, 8, 10);

      expect(result.groupRankings.hasValue).to.equal(true);
      expect(result.goodCqcRankings.hasValue).to.equal(true);
    });

    it('should be response with maxRank equal to number of comparison group rankings + current establishment', async () => {
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns({ amount: 3 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns({ amount: 3 });
      sinon.stub(models.benchmarksTimeInRoleByEstId, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1400, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1600, EstablishmentFK: 456 },
      ]);

      sinon.stub(models.benchmarksTimeInRoleByEstIdGoodOutstanding, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1550, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1400, EstablishmentFK: 400 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1700, EstablishmentFK: 550 },
      ]);

      const result = await rankings.timeInRole(establishmentId, 8, 10);

      expect(result.groupRankings.maxRank).to.equal(3);
      expect(result.goodCqcRankings.maxRank).to.equal(4);
    });

    it('should be response with currentRank against comparison group rankings', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns({ amount: 3 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns({ amount: 3 });
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.benchmarksTimeInRoleByEstId, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1.0, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1.0, EstablishmentFK: 456 },
      ]);

      sinon.stub(models.benchmarksTimeInRoleByEstIdGoodOutstanding, 'findAll').returns([
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1.0, EstablishmentFK: 456 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1.0, EstablishmentFK: 400 },
        { LocalAuthorityArea: 123, MainServiceFK: 1, InRoleFor12MonthsPercentage: 1.0, EstablishmentFK: 550 },
      ]);

      const result = await rankings.timeInRole(establishmentId, 8, 10);

      expect(result.groupRankings.currentRank).to.equal(1);
      expect(result.goodCqcRankings.currentRank).to.equal(1);
    });
  });
});

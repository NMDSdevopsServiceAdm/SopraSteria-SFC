const models = require('../../../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const rankings = require('../../../../../../../routes/v2/establishments/benchmarks/rankings');

describe('rankings', () => {
  const establishmentId = 123;

  beforeEach(() => {
    sinon.stub(models.cssr, 'getCSSRFromEstablishmentId').returns(10);
  });

  afterEach(() => {
    sinon.restore();
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
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
      expect(result.goodCqcRankings.currentRank).to.equal(2);
    });

    it('should be response with currentRank 1 when leavers value is 0', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(0);
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

      expect(result.groupRankings.currentRank).to.equal(1);
      expect(result.goodCqcRankings.currentRank).to.equal(1);
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
        .returns({ NumberOfStaffValue: 2, VacanciesValue: 'With Jobs' });
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
        .returns({ NumberOfStaffValue: 10, VacanciesValue: 'With Jobs' });
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
      expect(result.goodCqcRankings.currentRank).to.equal(2);
    });

    it('should be response with currentRank when vacancies value is 0', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, VacanciesValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(0);
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

      expect(result.groupRankings.currentRank).to.equal(1);
      expect(result.goodCqcRankings.currentRank).to.equal(1);
    });
  });
});

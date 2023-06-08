const models = require('../../../../../models');
const sinon = require('sinon');
const {
  payBenchmarks,
  turnoverBenchmarks,
  vacanciesBenchmarks,
  getMetaData,
  viewBenchmarks,
  qualificationsBenchmarks,
  sicknessBenchmarks,
  timeInRoleBenchmarks,
} = require('../../../../../routes/establishments/benchmarks');
const benchmarksService = require('../../../../../routes/establishments/benchmarks/benchmarksService');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

describe('/benchmarks', () => {
  afterEach(() => {
    sinon.restore();
  });

  const establishmentId = 123;
  const workerId = 10;
  const mainService = 8;

  const genericComparisonResponse = {
    LocalAuthorityArea: 211,
    MainServiceFK: 8,
    BaseEstablishments: 10,
  };

  const payComparisonResponse = {
    ...genericComparisonResponse,
    AverageHourlyRate: null,
    AverageAnnualFTE: null,
    MainJobRole: 10,
    BaseWorkers: 100,
  };

  const turnoverComparisonResponse = {
    ...genericComparisonResponse,
    TurnoverRate: null,
  };

  const vacanciesComparisonResponse = {
    ...genericComparisonResponse,
    VacancyRate: null,
  };

  const qualificationsComparisonResponse = {
    ...genericComparisonResponse,
    Qualifications: null,
  };

  const sicknessComparisonResponse = {
    ...genericComparisonResponse,
    AverageNoOfSickDays: null,
  };

  const timeInRoleComparisonResponse = {
    ...genericComparisonResponse,
    InRoleFor12MonthsPercentage: null,
  };

  describe('payBenchmarks', () => {
    it('should return response saying no data and no pay data if the workplace and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(payComparisonResponse)
        .onSecondCall()
        .returns(payComparisonResponse);
      sinon.stub(benchmarksService, 'getPay').returns({ stateMessage: 'no-pay-data' });
      const pay = await payBenchmarks(establishmentId, mainService, workerId);

      expect(pay).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-pay-data' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace pay data and message saying no data if the workplace has data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(payComparisonResponse)
        .onSecondCall()
        .returns(payComparisonResponse);
      sinon.stub(benchmarksService, 'getPay').returns({ value: 1500 });
      const pay = await payBenchmarks(establishmentId, mainService, workerId);

      expect(pay).to.deep.equal({
        workplaceValue: { hasValue: true, value: 1500 },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace pay data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1125 })
        .onSecondCall()
        .returns(payComparisonResponse);
      sinon.stub(benchmarksService, 'getPay').returns({ value: 1500 });

      const pay = await payBenchmarks(establishmentId, mainService, workerId);

      expect(pay).to.deep.equal({
        workplaceValue: { hasValue: true, value: 1500 },
        comparisonGroup: { hasValue: true, value: 1125 },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return the hourly pay values with comparison data for worker id of 10 or 25', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1125, AverageAnnualFTE: 25000 })
        .onSecondCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1250, AverageAnnualFTE: 26500 });
      sinon.stub(benchmarksService, 'getPay').returns({ value: 1500 });

      [10, 25].map(async (workerId) => {
        const pay = await payBenchmarks(establishmentId, mainService, workerId);

        expect(pay).to.deep.equal({
          workplaceValue: { hasValue: true, value: 1500 },
          comparisonGroup: { hasValue: true, value: 1125 },
          goodCqc: { hasValue: true, value: 1250 },
        });
      });
    });

    it('should return the annual pay values with comparison data for worker id of 22 or 23', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1125, AverageAnnualFTE: 25000 })
        .onSecondCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1250, AverageAnnualFTE: 26500 });
      sinon.stub(benchmarksService, 'getPay').returns({ value: 26000 });

      [22, 23].map(async (workerId) => {
        const pay = await payBenchmarks(establishmentId, mainService, workerId);

        expect(pay).to.deep.equal({
          workplaceValue: { hasValue: true, value: 26000 },
          comparisonGroup: { hasValue: true, value: 25000 },
          goodCqc: { hasValue: true, value: 26500 },
        });
      });
    });
  });

  describe('turnoverBenchmarks', () => {
    it('should return response saying mismatch-workers and no data if the workplace has a workers mismatch and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(turnoverComparisonResponse)
        .onSecondCall()
        .returns(turnoverComparisonResponse);

      sinon.stub(benchmarksService, 'getTurnover').returns({ stateMessage: 'mismatch-workers' });
      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'mismatch-workers' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response saying no-leavers and no data if the workplace has no leavers and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(turnoverComparisonResponse)
        .onSecondCall()
        .returns(turnoverComparisonResponse);

      sinon.stub(benchmarksService, 'getTurnover').returns({ stateMessage: 'no-leavers' });
      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-leavers' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response saying no-perm-or-temp and no data if the workplace has no perm or temp leavers and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(turnoverComparisonResponse)
        .onSecondCall()
        .returns(turnoverComparisonResponse);

      sinon.stub(benchmarksService, 'getTurnover').returns({ stateMessage: 'no-perm-or-temp' });
      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-perm-or-temp' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response saying incorrect-turnover and no data if the workplace has incorrect turnvover and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(turnoverComparisonResponse)
        .onSecondCall()
        .returns(turnoverComparisonResponse);

      sinon.stub(benchmarksService, 'getTurnover').returns({ stateMessage: 'incorrect-turnover' });
      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'incorrect-turnover' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace turnover data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.36 })
        .onSecondCall()
        .returns(turnoverComparisonResponse);

      sinon.stub(benchmarksService, 'getTurnover').returns({ value: 0.42 });

      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.42 },
        comparisonGroup: { hasValue: true, value: 0.36 },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace turnover data, comparison data and goodCQC comparison if the workplace has data and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.36 })
        .onSecondCall()
        .returns({ turnoverComparisonResponse, TurnoverRate: 0.33 });

      sinon.stub(benchmarksService, 'getTurnover').returns({ value: 0.42 });

      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.42 },
        comparisonGroup: { hasValue: true, value: 0.36 },
        goodCqc: { hasValue: true, value: 0.33 },
      });
    });

    it('should return response with workplace turnover data, comparison data and goodCQC comparison if the workplace has no leavers and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.36 })
        .onSecondCall()
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.33 });

      sinon.stub(benchmarksService, 'getTurnover').returns({ value: 0 });

      const turnover = await turnoverBenchmarks(establishmentId, mainService);

      expect(turnover).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0 },
        comparisonGroup: { hasValue: true, value: 0.36 },
        goodCqc: { hasValue: true, value: 0.33 },
      });
    });
  });

  describe('vacanciesBenchmarks', () => {
    it('should return response saying no-vacancies-data and no data if the workplace has no vacancies data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(vacanciesComparisonResponse)
        .onSecondCall()
        .returns(vacanciesComparisonResponse);

      sinon.stub(benchmarksService, 'getVacancies').returns({ stateMessage: 'no-vacancies-data' });
      const vacancies = await vacanciesBenchmarks(establishmentId, mainService);

      expect(vacancies).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-vacancies-data' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace vacancy data and message saying no data if the workplace has data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(vacanciesComparisonResponse)
        .onSecondCall()
        .returns(vacanciesComparisonResponse);
      sinon.stub(benchmarksService, 'getVacancies').returns({ value: 0.13 });
      const vacancies = await vacanciesBenchmarks(establishmentId, mainService);

      expect(vacancies).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.13 },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace vacancies data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.11 })
        .onSecondCall()
        .returns(vacanciesComparisonResponse);

      sinon.stub(benchmarksService, 'getVacancies').returns({ value: 0.13 });

      const vacancies = await vacanciesBenchmarks(establishmentId, mainService);

      expect(vacancies).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.13 },
        comparisonGroup: { hasValue: true, value: 0.11 },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace vacancies data, comparison data and goodCQC comparison if the workplace has data and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.11 })
        .onSecondCall()
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.1 });

      sinon.stub(benchmarksService, 'getVacancies').returns({ value: 0.13 });

      const vacancies = await vacanciesBenchmarks(establishmentId, mainService);

      expect(vacancies).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.13 },
        comparisonGroup: { hasValue: true, value: 0.11 },
        goodCqc: { hasValue: true, value: 0.1 },
      });
    });

    it('should return response with workplace vacancies data, comparison data and goodCQC comparison if the workplace has no vacancies and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.11 })
        .onSecondCall()
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.1 });

      sinon.stub(benchmarksService, 'getVacancies').returns({ value: 0 });

      const vacancies = await vacanciesBenchmarks(establishmentId, mainService);

      expect(vacancies).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0 },
        comparisonGroup: { hasValue: true, value: 0.11 },
        goodCqc: { hasValue: true, value: 0.1 },
      });
    });
  });

  describe('qualificationsBenchmarks', () => {
    it('should return response saying no-qualifications-data and no data if the workplace has no vacancies data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(qualificationsComparisonResponse)
        .onSecondCall()
        .returns(qualificationsComparisonResponse);

      sinon.stub(benchmarksService, 'getQualifications').returns({ stateMessage: 'no-qualifications-data' });
      const qualifications = await qualificationsBenchmarks(establishmentId, mainService);

      expect(qualifications).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-qualifications-data' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace qualifications data and message saying no data if the workplace has data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(qualificationsComparisonResponse)
        .onSecondCall()
        .returns(qualificationsComparisonResponse);
      sinon.stub(benchmarksService, 'getQualifications').returns({ value: 0.5 });
      const qualifications = await qualificationsBenchmarks(establishmentId, mainService);

      expect(qualifications).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.5 },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace qualifications data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.47 })
        .onSecondCall()
        .returns(qualificationsComparisonResponse);

      sinon.stub(benchmarksService, 'getQualifications').returns({ value: 0.5 });

      const qualifications = await qualificationsBenchmarks(establishmentId, mainService);

      expect(qualifications).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.5 },
        comparisonGroup: { hasValue: true, value: 0.47 },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace qualifications data, comparison data and goodCQC comparison if the workplace has data and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.47 })
        .onSecondCall()
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.53 });

      sinon.stub(benchmarksService, 'getQualifications').returns({ value: 0.5 });

      const qualifications = await qualificationsBenchmarks(establishmentId, mainService);

      expect(qualifications).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0.5 },
        comparisonGroup: { hasValue: true, value: 0.47 },
        goodCqc: { hasValue: true, value: 0.53 },
      });
    });

    it('should return response with workplace qualifications data, comparison data and goodCQC comparison if the workplace has no qualifications and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.47 })
        .onSecondCall()
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.53 });

      sinon.stub(benchmarksService, 'getQualifications').returns({ value: 0 });

      const qualifications = await qualificationsBenchmarks(establishmentId, mainService);

      expect(qualifications).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0 },
        comparisonGroup: { hasValue: true, value: 0.47 },
        goodCqc: { hasValue: true, value: 0.53 },
      });
    });
  });

  describe('sicknessBenchmarks', () => {
    it('should return response saying no-sickness-data and no data if the workplace has no sickness data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(sicknessComparisonResponse)
        .onSecondCall()
        .returns(sicknessComparisonResponse);

      sinon.stub(benchmarksService, 'getSickness').returns({ stateMessage: 'no-sickness-data' });
      const sickness = await sicknessBenchmarks(establishmentId, mainService);

      expect(sickness).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-sickness-data' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace sickness data and message saying no data if the workplace has data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(sicknessComparisonResponse)
        .onSecondCall()
        .returns(sicknessComparisonResponse);
      sinon.stub(benchmarksService, 'getSickness').returns({ value: 7 });
      const sickness = await sicknessBenchmarks(establishmentId, mainService);

      expect(sickness).to.deep.equal({
        workplaceValue: { hasValue: true, value: 7 },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace sickness data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 9 })
        .onSecondCall()
        .returns(sicknessComparisonResponse);

      sinon.stub(benchmarksService, 'getSickness').returns({ value: 7 });

      const sickness = await sicknessBenchmarks(establishmentId, mainService);

      expect(sickness).to.deep.equal({
        workplaceValue: { hasValue: true, value: 7 },
        comparisonGroup: { hasValue: true, value: 9 },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace sickness data, comparison data and goodCQC comparison if the workplace has data and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 9 })
        .onSecondCall()
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 8 });

      sinon.stub(benchmarksService, 'getSickness').returns({ value: 7 });

      const sickness = await sicknessBenchmarks(establishmentId, mainService);

      expect(sickness).to.deep.equal({
        workplaceValue: { hasValue: true, value: 7 },
        comparisonGroup: { hasValue: true, value: 9 },
        goodCqc: { hasValue: true, value: 8 },
      });
    });

    it('should return response with workplace sickness data, comparison data and goodCQC comparison if the workplace has no sickness and there is comparison data and good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 9 })
        .onSecondCall()
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 8 });

      sinon.stub(benchmarksService, 'getSickness').returns({ value: 0 });

      const sickness = await sicknessBenchmarks(establishmentId, mainService);

      expect(sickness).to.deep.equal({
        workplaceValue: { hasValue: true, value: 0 },
        comparisonGroup: { hasValue: true, value: 9 },
        goodCqc: { hasValue: true, value: 8 },
      });
    });
  });

  describe('timeInRoleBenchmarks', () => {
    it('should return response saying no-perm-or-temp and no data if the workplace has no workers and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(timeInRoleComparisonResponse)
        .onSecondCall()
        .returns(timeInRoleComparisonResponse);

      sinon.stub(benchmarksService, 'getTimeInRole').returns({ stateMessage: 'no-perm-or-temp' });
      const timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

      expect(timeInRole).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'no-perm-or-temp' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response saying incorrect-time-in-role and no data if the workplace has fewer workers than workers that have been in their job for 12 months and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(timeInRoleComparisonResponse)
        .onSecondCall()
        .returns(timeInRoleComparisonResponse);

      sinon.stub(benchmarksService, 'getTimeInRole').returns({ stateMessage: 'incorrect-time-in-role' });
      const timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

      expect(timeInRole).to.deep.equal({
        workplaceValue: { hasValue: false, value: 0, stateMessage: 'incorrect-time-in-role' },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace time in role data and message saying no data if the workplace has data and comparison data is not present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns(timeInRoleComparisonResponse)
        .onSecondCall()
        .returns(timeInRoleComparisonResponse);

      sinon.stub(benchmarksService, 'getTimeInRole').returns({ value: 0.85 });
      const timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

      expect(timeInRole).to.deep.equal({
        workplaceValue: { value: 0.85, hasValue: true },
        comparisonGroup: { hasValue: false, value: 0, stateMessage: 'no-data' },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace time in role data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...timeInRoleComparisonResponse, InRoleFor12MonthsPercentage: 0.83 })
        .onSecondCall()
        .returns(timeInRoleComparisonResponse);

      sinon.stub(benchmarksService, 'getTimeInRole').returns({ value: 0.85 });
      const timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

      expect(timeInRole).to.deep.equal({
        workplaceValue: { value: 0.85, hasValue: true },
        comparisonGroup: { value: 0.83, hasValue: true },
        goodCqc: { hasValue: false, value: 0, stateMessage: 'no-data' },
      });
    });

    it('should return response with workplace time in role data, comparison data and message saying no data for goodCQC comparison if the workplace has data and there is comparison data but no good cqc data is present', async () => {
      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...timeInRoleComparisonResponse, InRoleFor12MonthsPercentage: 0.83 })
        .onSecondCall()
        .returns({ ...timeInRoleComparisonResponse, InRoleFor12MonthsPercentage: 0.87 });

      sinon.stub(benchmarksService, 'getTimeInRole').returns({ value: 0.85 });
      const timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

      expect(timeInRole).to.deep.equal({
        workplaceValue: { value: 0.85, hasValue: true },
        comparisonGroup: { value: 0.83, hasValue: true },
        goodCqc: { value: 0.87, hasValue: true },
      });
    });
  });

  describe('getMetaData', async () => {
    it('should return meta data with the staff, workplaces, last updated and local authority present', async () => {
      sinon.stub(models.benchmarksEstablishmentsAndWorkers, 'getComparisonData').returns({
        workplaces: 10,
        staff: 108,
        localAuthority: 'A local authority',
      });

      sinon.stub(models.benchmarksEstablishmentsAndWorkersGoodOutstanding, 'getComparisonData').returns({
        BaseEstablishments: 9,
        WorkerCount: 98,
      });

      const date = new Date();
      sinon.stub(models.dataImports, 'benchmarksLastUpdated').returns(date);

      const metaData = await getMetaData(establishmentId, mainService);
      expect(metaData).to.deep.equal({
        workplaces: 10,
        staff: 108,
        workplacesGoodCqc: 9,
        staffGoodCqc: 98,
        lastUpdated: date,
        localAuthority: 'A local authority',
      });
    });

    it('should return meta data with the last updated but without the staff, workplaces and local authority present if no comparison group', async () => {
      sinon.stub(models.benchmarksEstablishmentsAndWorkers, 'getComparisonData').returns(null);
      sinon.stub(models.benchmarksEstablishmentsAndWorkersGoodOutstanding, 'getComparisonData').returns(null);
      const date = new Date();
      sinon.stub(models.dataImports, 'benchmarksLastUpdated').returns(date);

      const metaData = await getMetaData(establishmentId, mainService);
      expect(metaData).to.deep.equal({
        workplaces: 0,
        staff: 0,
        workplacesGoodCqc: 0,
        staffGoodCqc: 0,
        lastUpdated: date,
        localAuthority: null,
      });
    });
  });

  describe('viewBenchmarks', () => {
    let req;
    let res;

    beforeEach(() => {
      const request = {
        method: 'GET',
        url: '/api/establishment/benchmarks',
        establishmentId: 123,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();

      sinon
        .stub(benchmarksService, 'getComparisonData')
        .onFirstCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1125, AverageAnnualFTE: 25000 })
        .onSecondCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1150, AverageAnnualFTE: 26500 })
        .onThirdCall()
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1425, AverageAnnualFTE: 30000 })
        .onCall(3)
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1475, AverageAnnualFTE: 31000 })
        .onCall(4)
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1320, AverageAnnualFTE: 28000 })
        .onCall(5)
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1250, AverageAnnualFTE: 27000 })
        .onCall(6)
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1510, AverageAnnualFTE: 35000 })
        .onCall(7)
        .returns({ ...payComparisonResponse, AverageHourlyRate: 1515, AverageAnnualFTE: 36000 })
        .onCall(8)
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.11 })
        .onCall(9)
        .returns({ ...vacanciesComparisonResponse, VacancyRate: 0.1 })
        .onCall(10)
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.25 })
        .onCall(11)
        .returns({ ...turnoverComparisonResponse, TurnoverRate: 0.23 })
        .onCall(12)
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.47 })
        .onCall(13)
        .returns({ ...qualificationsComparisonResponse, Qualifications: 0.53 })
        .onCall(14)
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 9 })
        .onCall(15)
        .returns({ ...sicknessComparisonResponse, AverageNoOfSickDays: 8 })
        .onCall(16)
        .returns({ ...timeInRoleComparisonResponse, InRoleFor12MonthsPercentage: 0.81 })
        .onCall(17)
        .returns({ ...timeInRoleComparisonResponse, InRoleFor12MonthsPercentage: 0.85 });
    });

    it('should return 200 and the data when successfully getting the benchmarks data', async () => {
      sinon.stub(models.establishment, 'findbyId').returns({ mainService: { reportingID: 8 } });
      sinon
        .stub(benchmarksService, 'getPay')
        .onFirstCall()
        .returns({ value: 1110 })
        .onSecondCall()
        .returns({ value: 1450 })
        .onThirdCall()
        .returns({ value: 27500 })
        .onCall(3)
        .returns({ value: 34000 });

      sinon.stub(benchmarksService, 'getTurnover').returns({ value: 0.27 });
      sinon.stub(benchmarksService, 'getVacancies').returns({ value: 0.13 });
      sinon.stub(benchmarksService, 'getQualifications').returns({ value: 0.5 });
      sinon.stub(benchmarksService, 'getSickness').returns({ value: 7 });
      sinon.stub(benchmarksService, 'getTimeInRole').returns({ value: 0.82 });
      sinon
        .stub(models.benchmarksEstablishmentsAndWorkers, 'getComparisonData')
        .returns({ workplaces: 10, staff: 103, localAuthority: 'Leeds' });
      sinon
        .stub(models.benchmarksEstablishmentsAndWorkersGoodOutstanding, 'getComparisonData')
        .returns({ BaseEstablishments: 8, WorkerCount: 94 });
      sinon.stub(models.dataImports, 'benchmarksLastUpdated').returns('01/10/2020');

      const expectedResponse = {
        meta: {
          workplaces: 10,
          staff: 103,
          workplacesGoodCqc: 8,
          staffGoodCqc: 94,
          localAuthority: 'Leeds',
          lastUpdated: '01/10/2020',
        },
        careWorkerPay: {
          workplaceValue: { value: 1110, hasValue: true },
          comparisonGroup: { value: 1125, hasValue: true },
          goodCqc: { value: 1150, hasValue: true },
        },
        seniorCareWorkerPay: {
          workplaceValue: { value: 1450, hasValue: true },
          comparisonGroup: { value: 1425, hasValue: true },
          goodCqc: { value: 1475, hasValue: true },
        },
        registeredNursePay: {
          workplaceValue: { value: 27500, hasValue: true },
          comparisonGroup: { value: 28000, hasValue: true },
          goodCqc: { value: 27000, hasValue: true },
        },
        registeredManagerPay: {
          workplaceValue: { value: 34000, hasValue: true },
          comparisonGroup: { value: 35000, hasValue: true },
          goodCqc: { value: 36000, hasValue: true },
        },
        vacancyRate: {
          workplaceValue: { value: 0.13, hasValue: true },
          comparisonGroup: { value: 0.11, hasValue: true },
          goodCqc: { value: 0.1, hasValue: true },
        },
        turnoverRate: {
          workplaceValue: { value: 0.27, hasValue: true },
          comparisonGroup: { value: 0.25, hasValue: true },
          goodCqc: { value: 0.23, hasValue: true },
        },
        qualifications: {
          workplaceValue: { value: 0.5, hasValue: true },
          comparisonGroup: { value: 0.47, hasValue: true },
          goodCqc: { value: 0.53, hasValue: true },
        },
        sickness: {
          workplaceValue: { value: 7, hasValue: true },
          comparisonGroup: { value: 9, hasValue: true },
          goodCqc: { value: 8, hasValue: true },
        },
        timeInRole: {
          workplaceValue: { value: 0.82, hasValue: true },
          comparisonGroup: { value: 0.81, hasValue: true },
          goodCqc: { value: 0.85, hasValue: true },
        },
      };
      await viewBenchmarks(req, res);
      const response = res._getJSONData();

      expect(res.statusCode).to.deep.equal(200);
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return 500 when an error is thrown', async () => {
      sinon.stub(models.establishment, 'findbyId').returns({ MainServiceFKValue: 8 });

      sinon.stub(benchmarksService, 'getPay').throws();
      await viewBenchmarks(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});

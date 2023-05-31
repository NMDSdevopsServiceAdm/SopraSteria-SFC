const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarksService = require('../../../../../routes/establishments/benchmarks/benchmarksService');

describe.only('/benchmarks/benchmarksService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const establishmentId = 123;

  describe('getPay', () => {
    it('should return the average hourly pay in pence when there is one', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 15.0 });

      const params = { establishmentId, mainJob: 10, annualOrHourly: 'Hourly' };
      const result = await benchmarksService.getPay(params);

      expect(result.value).to.equal(1500);
    });

    it('should return the average annual pay in pounds when there is one ', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: 30000 });

      const params = { establishmentId, mainJob: 23, annualOrHourly: 'Annually' };
      const result = await benchmarksService.getPay(params);

      expect(result.value).to.equal(30000);
    });

    it('should return a stateMessage with no-pay-data if there is none', async () => {
      sinon.stub(models.worker, 'averageHourlyPay').returns({ amount: null });

      const params = { establishmentId, mainJob: 23, annualOrHourly: 'Annually' };
      const result = await benchmarksService.getPay(params);

      expect(result.stateMessage).to.equal('no-pay-data');
    });
  });

  describe('getQualifications', () => {
    it('should return the percentage of higher qualifications', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 1 });

      const params = { establishmentId };
      const result = await benchmarksService.getQualifications(params);

      expect(result.value).to.equal(0.5);
    });

    it('should return the percentage of higher qualifications as 0 if there are none', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 1, noQuals: 1, lvl2Quals: 0 });

      const params = { establishmentId };
      const result = await benchmarksService.getQualifications(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with no-qualification-data if there is none', async () => {
      sinon
        .stub(models.worker, 'countSocialCareQualificationsAndNoQualifications')
        .returns({ quals: 0, noQuals: 0, lvl2Quals: 0 });

      const params = { establishmentId };
      const result = await benchmarksService.getQualifications(params);

      expect(result.stateMessage).to.equal('no-qualifications-data');
    });
  });

  describe('getSickness', () => {
    it('should return the average number of sick days per worker', async () => {
      sinon.stub(models.establishment, 'workers').returns({ workers: [{ DaysSickDays: 3 }, { DaysSickDays: 7 }] });

      const params = { establishmentId };
      const result = await benchmarksService.getSickness(params);

      expect(result.value).to.equal(5);
    });

    it('should return a stateMessage with no-sickness-data if there is none', async () => {
      sinon.stub(models.establishment, 'workers').returns(null);

      const params = { establishmentId };
      const result = await benchmarksService.getSickness(params);

      expect(result.stateMessage).to.equal('no-sickness-data');
    });
  });

  describe('getTurnover', () => {
    it('should return the percentage of permanent staff', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.value).to.equal(0.5);
    });

    it('should return a value of 0 if there is a LeaversValue of None', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with mismatch-workers when the workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with mismatch-workers when the staff count does not match the workplace', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with no-leavers when the workplace has no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('no-leavers');
    });

    it('should return a stateMessage with no-perm-or-temp when there have been no leavers', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should return a stateMessage with incorrect-turnover when turnover is too high', async () => {
      sinon.stub(models.establishment, 'turnoverData').returns({ NumberOfStaffValue: 2, LeaversValue: 1 });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(10);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('incorrect-turnover');
    });
  });

  describe('getVacancies', () => {
    it('should return a value of 0 if there is a VacnciesValue of None', async () => {
      sinon.stub(models.establishment, 'vacanciesData').returns({ VacanciesValue: 'With Jobs' });
      sinon.stub(models.establishmentJobs, 'vacanciesForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.value).to.equal(1);
    });

    it('should return a value of 0 if there is a VacnciesValue of None', async () => {
      sinon.stub(models.establishment, 'vacanciesData').returns({ VacanciesValue: 'None' });

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with no-vacancies-data when there have been no leavers', async () => {
      sinon.stub(models.establishment, 'vacanciesData').returns(null);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.stateMessage).to.equal('no-vacancies-data');
    });
  });
});

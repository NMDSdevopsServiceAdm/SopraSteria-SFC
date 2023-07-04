const models = require('../../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarksService = require('../../../../../routes/establishments/benchmarks/benchmarksService');

describe('/benchmarks/benchmarksService', () => {
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
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(2);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.value).to.equal(0.5);
    });

    it('should return a value of 0 if there is a LeaversValue of None', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with mismatch-workers when the workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with mismatch-workers when the staff count does not match the workplace', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with no-leavers when the workplace has no leavers', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('no-leavers');
    });

    it('should return a stateMessage with no-perm-or-temp when there is not a perm or temp count', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should return a stateMessage with incorrect-turnover when turnover is too high', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(10);

      const params = { establishmentId };
      const result = await benchmarksService.getTurnover(params);

      expect(result.stateMessage).to.equal('incorrect-turnover');
    });
  });

  describe('getVacancies', () => {
    it('should return the percentage of vacancies', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversOrVacanciesForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.value).to.equal(0.25);
    });

    it('should return a value of 0 if there is a VacanciesValue of None', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 3, VacanciesValue: 'None' });
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with mismatch-workers when the workplace has no staff records', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 0 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with mismatch-workers when the staff count does not match the workplace', async () => {
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with no-vacancies when the workplace has no vacancies', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, VacanciesValue: "Don't know" });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.stateMessage).to.equal('no-vacancies');
    });

    it('should return a stateMessage with no-perm-or-temp when there is not a perm or temp count', async () => {
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 2, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(2);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getVacancies(params);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });
  });

  describe('getTimeInRole', () => {
    it('should return the percentage of workers that have been in their jobs for 12 months or more', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 6, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns(3);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(6);
      sinon.stub(models.worker, 'countForEstablishment').returns(6);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.value).to.equal(0.5);
    });

    it('should return a value of 0 if there are no workers that have been more than 12 months in their jobs', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns(0);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(6);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 6, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(6);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.value).to.equal(0);
    });

    it('should return a stateMessage with no-perm-or-temp if the workplace has no staff', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns(0);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 1, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.stateMessage).to.equal('no-perm-or-temp');
    });

    it('should return a stateMessage with incorrect-time-in-role if there are more workers that have been in their job for 12 months than workers in the workplace', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns(5);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 1, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.stateMessage).to.equal('incorrect-time-in-role');
    });

    it('should return a stateMessage with mismatch-workers when the staff count does not match the workplace', async () => {
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(0);
      sinon.stub(models.establishment, 'turnoverAndVacanciesData').returns({ NumberOfStaffValue: 2 });
      sinon.stub(models.worker, 'countForEstablishment').returns(0);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.stateMessage).to.equal('mismatch-workers');
    });

    it('should return a stateMessage with not-enough-data when there are staff records with no start date set for the workplace', async () => {
      sinon.stub(models.worker, 'yearOrMoreInRoleCount').returns(5);
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon
        .stub(models.establishment, 'turnoverAndVacanciesData')
        .returns({ NumberOfStaffValue: 1, VacanciesValue: 'With Jobs' });
      sinon.stub(models.worker, 'countForEstablishment').returns(1);
      sinon.stub(models.worker, 'countForPermAndTempNoStartDate').returns(1);

      const params = { establishmentId };
      const result = await benchmarksService.getTimeInRole(params);

      expect(result.stateMessage).to.equal('not-enough-data');
    });
  });
});

const models = require('../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarks = require('../../../../routes/establishments/benchmarks');

describe('benchmarks', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('pay', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'careworkersWithHourlyPayCount').returns(100);
      sinon.stub(models.worker, 'careworkersTotalHourlyPaySum').returns(50);

      const json = await benchmarks.pay(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 50,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'careworkersWithHourlyPayCount').returns(null);
      sinon.stub(models.worker, 'careworkersTotalHourlyPaySum').returns(null);

      const json = await benchmarks.pay(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('sickness', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns({
        id: 2298,
        workers: [
          {
            id: '',
            uid: '',
            DaysSickDays: '10',
          },
          {
            id: '',
            uid: '',
            DaysSickDays: '50',
          },
          {
            id: '',
            uid: '',
            DaysSickDays: '10',
          },
        ],
      });

      const json = await benchmarks.sickness(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 23,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(null);

      const json = await benchmarks.sickness(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('qualifications', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'specificJobsAndSocialCareQuals').returns(2);
      sinon.stub(models.worker, 'specificJobsAndNoSocialCareQuals').returns(4);
      sinon.stub(models.worker, 'benchmarkQualsCount').returns(3);

      const json = await benchmarks.qualifications(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0.5,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'specificJobsAndSocialCareQuals').returns(0);
      sinon.stub(models.worker, 'specificJobsAndNoSocialCareQuals').returns(0);
      sinon.stub(models.worker, 'benchmarkQualsCount').returns(null);
      const json = await benchmarks.qualifications(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('turnover', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0.3333333333333333,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return the 0% if there are no new leavers', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: 'None' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return no-permtemp are currently no perm or temp workers', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'turnOverData').returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: '5' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(0);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-permTemp',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return no-data if  leavers isnt filled out', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'turnOverData').returns({ id: '2', NumberOfStaffValue: 3 });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return the no-data when LeaversValue Dont know', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: "Don't know" });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return 0 when LeaversValue None', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: 'None' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return the check-data when calculation > 9.95', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 3, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(60);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'check-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
    it('should return the no-workers when NumberOfStaffValue = 0', async () => {
      const establishmentId = 123;
      sinon
        .stub(models.establishment, 'turnOverData')
        .returns({ id: '2', NumberOfStaffValue: 0, LeaversValue: 'With Jobs' });
      sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
      sinon.stub(models.worker, 'countForEstablishment').returns(3);
      sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
      const json = await benchmarks.turnover(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
        lowTurnover: {
          hasValue: false,
          stateMessage: 'no-data',
          value: 0,
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
  it('should return the no-workers when NumberOfStaffValue isnt equal to countForEstablishment', async () => {
    const establishmentId = 123;
    sinon.stub(models.establishment, 'turnOverData').returns(
      { id: '2', NumberOfStaffValue: 10, LeaversValue: 'With Jobs' }, // NumberOfStaffValue 10  countForEstablishment: 3
    );
    sinon.stub(models.worker, 'permAndTempCountForEstablishment').returns(3);
    sinon.stub(models.worker, 'countForEstablishment').returns(3);
    sinon.stub(models.establishmentJobs, 'leaversForEstablishment').returns(1);
    const json = await benchmarks.turnover(establishmentId);
    const expectedJSON = {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-workers',
      },
      goodCqc: {
        hasValue: false,
        stateMessage: 'no-data',
        value: 0,
      },
      lowTurnover: {
        hasValue: false,
        stateMessage: 'no-data',
        value: 0,
      },
      comparisonGroup: {
        value: 0,
        hasValue: false,
        stateMessage: 'no-data',
      },
    };
    expect(json).to.deep.equal(expectedJSON);
  });
  describe('comparisonGroupData', () => {
    it('should return the correct pay comparison Data', async () => {
      const benchmarkComparisonGroup = {
        CssrID: 0,
        MainServiceFK: 0,
        pay: 10,
        sickness: 10,
        turnover: '9.99',
        qualifications: '9.99',
        workplaces: 5,
        staff: 1000,
      };

      const expectedJson = {
        value: 10,
        hasValue: true,
      };

      const json = benchmarks.buildComparisonGroupMetrics('pay', benchmarkComparisonGroup);

      expect(json.comparisonGroup).to.deep.equal(expectedJson);
    });
    it('should return the correct sickness comparison Data', async () => {
      const benchmarkComparisonGroup = {
        CssrID: 0,
        MainServiceFK: 0,
        pay: 10,
        sickness: 1,
        turnover: '9.99',
        qualifications: '9.99',
        workplaces: 5,
        staff: 1000,
      };

      const expectedJson = {
        value: 1,
        hasValue: true,
      };
      const json = benchmarks.buildComparisonGroupMetrics('sickness', benchmarkComparisonGroup);

      expect(json.comparisonGroup).to.deep.equal(expectedJson);
    });
    it('should return the correct state message when there is no comparison group value', async () => {
      const benchmarkComparisonGroup = null;

      const json = benchmarks.buildComparisonGroupMetrics('pay', benchmarkComparisonGroup);

      const expectedJson = {
        value: 0,
        hasValue: false,
        stateMessage: 'no-data',
      };

      expect(json.comparisonGroup).to.deep.equal(expectedJson);
    });
  });
  describe('getMetaData', () => {
    it('should return the correct meta Data', async () => {
      sinon.stub(models.dataImports, 'benchmarksLastUpdated').returns(new Date(2020, 0, 1));

      const benchmarkComparisonGroup = {
        CssrID: 0,
        MainServiceFK: 0,
        pay: 10,
        sickness: 10,
        turnover: '9.99',
        qualifications: '9.99',
        workplaces: 5,
        staff: 1000,
      };

      const expectedJson = {
        workplaces: 5,
        staff: 1000,
        lastUpdated: new Date(2020, 0, 1),
      };
      const json = await benchmarks.getMetaData(benchmarkComparisonGroup);

      expect(json).to.deep.equal(expectedJson);
    });
    it('should return the correct meta data when there is no comparison group data', async () => {
      sinon.stub(models.dataImports, 'benchmarksLastUpdated').returns(null);
      const benchmarkComparisonGroup = null;

      const expectedJson = {
        workplaces: 0,
        staff: 0,
        lastUpdated: null,
      };
      const json = await benchmarks.getMetaData(benchmarkComparisonGroup);

      expect(json).to.deep.equal(expectedJson);
    });
  });
});

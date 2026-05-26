const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models/index');
const { build, sequence, oneOf, fake } = require('@jackfranklin/test-data-bot');

describe('establishment model', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('fetchWorkersWithPayData', () => {
    const workerBuilder = build('Worker', {
      fields: {
        uid: fake((f) => f.datatype.uuid()),
        nameOrId: fake((f) => f.name.findName()),
        mainJob: {
          id: sequence(),
          title: fake((f) => f.name.jobTitle()),
        },
        AnnualHourlyPayValue: oneOf('Annually', 'Hourly', "Don't know", null),
        AnnualHourlyPayRate: null,
      },
    });

    const mockEstablishmentId = '1';

    it('should call models.worker.findAndCountAll with the given query params', async () => {
      const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()];
      sinon.stub(models.worker, 'findAndCountAll').resolves({ count: 3, rows: mockWorkers });

      await models.establishment.fetchWorkersWithPayData({
        establishmentId: mockEstablishmentId,
        itemsPerPage: 20,
        pageIndex: 2,
        sortBy: 'staffNameDesc',
        jobId: 10,
      });

      expect(models.worker.findAndCountAll).to.have.been.calledWithMatch({
        where: {
          establishmentFk: mockEstablishmentId,
          archived: false,
        },
        offset: 20 * 2,
        limit: 20,
        order: [['nameOrId', 'DESC']],
        include: [
          {
            model: models.job,
            as: 'mainJob',
            attributes: ['title', 'id'],
            where: { id: 10 },
          },
        ],
      });
    });

    it('should format the pay data in the same schema as worker class', async () => {
      const mockWorkers = [
        {
          nameOrId: 'Worker A',
          mainJob: { id: 10, title: 'Care worker' },
          AnnualHourlyPayValue: 'Annually',
          AnnualHourlyPayRate: '25000',
        },
        {
          nameOrId: 'Worker B',
          mainJob: { id: 10, title: 'Care worker' },
          AnnualHourlyPayValue: 'Hourly',
          AnnualHourlyPayRate: '25',
        },
        {
          nameOrId: 'Worker C',
          mainJob: { id: 10, title: 'Care worker' },
          AnnualHourlyPayValue: "Don't know",
          AnnualHourlyPayRate: null,
        },
      ];
      const expectedResult = {
        count: 3,
        workers: [
          {
            nameOrId: 'Worker A',
            mainJob: { id: 10, title: 'Care worker' },
            annualHourlyPay: { value: 'Annually', rate: 25000 },
          },
          {
            nameOrId: 'Worker B',
            mainJob: { id: 10, title: 'Care worker' },
            annualHourlyPay: { value: 'Hourly', rate: 25 },
          },
          {
            nameOrId: 'Worker C',
            mainJob: { id: 10, title: 'Care worker' },
            annualHourlyPay: { value: "Don't know" },
          },
        ],
      };

      sinon.stub(models.worker, 'findAndCountAll').resolves({ count: 3, rows: mockWorkers });

      const result = await models.establishment.fetchWorkersWithPayData({
        establishmentId: mockEstablishmentId,
      });

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

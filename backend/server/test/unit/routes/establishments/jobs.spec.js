const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const lodash = require('lodash');

const models = require('../../../../models/index');
const { Establishment } = require('../../../../models/classes/establishment');
const { establishmentBuilder } = require('../../../factories/models');
const { getJobs, updateJobs } = require('../../../../routes/establishments/jobs');

describe('backend/server/routes/establishments/jobs.js', () => {
  const mockEstablishment = establishmentBuilder();
  mockEstablishment.VacanciesValue = 'With Jobs';
  mockEstablishment.StartersValue = 'With Jobs';
  mockEstablishment.LeaversValue = 'With Jobs';

  let req;
  let res;

  const mockVacanciesDatabaseRecord = [
    { id: 1, total: 2, type: 'Vacancies', reference: { id: 10, title: 'Care worker' } },
    {
      id: 2,
      total: 3,
      type: 'Vacancies',
      other: 'Other job name 1',
      reference: { id: 20, title: 'Other (directly involved in providing care)' },
    },
  ];
  const mockStartersDatabaseRecord = [
    { id: 3, total: 5, type: 'Starters', reference: { id: 17, title: 'Nursing associate' } },
    {
      id: 4,
      total: 7,
      type: 'Starters',
      other: 'Other job name 2',
      reference: { id: 20, title: 'Other (directly involved in providing care)' },
    },
  ];
  const mockLeaversDatabaseRecord = [
    { id: 5, total: 11, type: 'Leavers', reference: { id: 15, title: 'Senior care worker' } },
    {
      id: 6,
      total: 13,
      type: 'Leavers',
      other: 'Other job name 3',
      reference: { id: 20, title: 'Other (directly involved in providing care)' },
    },
  ];

  beforeEach(() => {
    sinon.stub(models.establishment, 'findOne').resolves(mockEstablishment);
    sinon.stub(models.job, 'findAll').resolves([
      { id: 10, title: 'Care worker' },
      { id: 17, title: 'Nursing associate' },
      { id: 15, title: 'Senior care worker' },
      { id: 20, title: 'Other (directly involved in providing care)' },
    ]);

    sinon.stub(models.services, 'findOne').resolves(null);
    sinon.stub(models.serviceUsers, 'findAll').resolves([]);
    sinon.stub(models.establishmentServiceUsers, 'findAll').resolves([]);
    sinon.stub(models.establishmentServices, 'findAll').resolves([]);
    sinon.stub(models.establishmentAudit, 'findAll').resolves([]);
    sinon.stub(models.establishmentCapacity, 'findAll').resolves([]);
    sinon.stub(models.pcodedata, 'getLinkedCssrRecordsFromPostcode').resolves(null);
    sinon.stub(Establishment.prototype, 'isWdfEligible').resolves({ currentEligibility: false });
    sinon.stub(models.sequelize, 'transaction').callsFake((func) => func('fake-transaction'));

    sinon
      .stub(models.establishmentJobs, 'findAll')
      .resolves([...mockVacanciesDatabaseRecord, ...mockStartersDatabaseRecord, ...mockLeaversDatabaseRecord]);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getJobs', () => {
    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/establishment/123/jobs',
        establishmentId: 123,
      });
      res = httpMocks.createResponse();
    });

    it('should include an `other` field in starters/leavers/vacancies if applicable', async () => {
      await getJobs(req, res);

      expect(res.statusCode).to.equal(200);

      const responseData = res._getJSONData();

      expect(responseData.vacancies).to.deep.equal([
        { jobId: 10, title: 'Care worker', total: 2 },
        { jobId: 20, title: 'Other (directly involved in providing care)', total: 3, other: 'Other job name 1' },
      ]);
      expect(responseData.starters).to.deep.equal([
        { jobId: 17, title: 'Nursing associate', total: 5 },
        { jobId: 20, title: 'Other (directly involved in providing care)', total: 7, other: 'Other job name 2' },
      ]);
      expect(responseData.leavers).to.deep.equal([
        { jobId: 15, title: 'Senior care worker', total: 11 },
        { jobId: 20, title: 'Other (directly involved in providing care)', total: 13, other: 'Other job name 3' },
      ]);
    });
  });

  describe('updateJobs', () => {
    beforeEach(() => {
      sinon
        .stub(models.establishment, 'update')
        .callsFake((input) => [1, [{ get: () => ({ ...input, EstablishmentID: 123 }) }]]);
      sinon.stub(models.establishmentAudit, 'bulkCreate').resolves(null);
    });

    const testCases = [
      { jobType: 'vacancies', jobTypeModel: models.establishmentVacancies },
      { jobType: 'starters', jobTypeModel: models.establishmentStarters },
      { jobType: 'leavers', jobTypeModel: models.establishmentLeavers },
    ];

    testCases.forEach(({ jobType, jobTypeModel }) => {
      describe(`for job type: ${jobType}`, () => {
        const jobTypeInCapital = lodash.capitalize(jobType);

        it('should update establishment jobs record when `other` field is changed', async () => {
          const destroySpy = sinon.stub(jobTypeModel, 'destroy').resolves(null);
          const bulkCreateSpy = sinon.stub(jobTypeModel, 'bulkCreate').resolves(null);

          req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/establishment/123/jobs',
            establishmentId: 123,
            username: 'adminUser',
            body: {
              [jobType]: [
                { jobId: 10, total: 2 },
                { jobId: 20, total: 3, other: 'Changed job role name' },
              ],
            },
          });
          res = httpMocks.createResponse();

          await updateJobs(req, res);

          expect(res.statusCode).to.equal(200);

          expect(destroySpy).to.have.been.calledOnce;

          expect(bulkCreateSpy).to.have.been.calledOnce;
          expect(bulkCreateSpy.getCall(0).args[0]).to.deep.equal([
            {
              establishmentId: 123,
              jobId: 10,
              other: null,
              total: 2,
              type: jobTypeInCapital,
            },
            {
              establishmentId: 123,
              jobId: 20,
              other: 'Changed job role name',
              total: 3,
              type: jobTypeInCapital,
            },
          ]);
        });

        it('should clear the text in `other` field if not found in request body', async () => {
          const destroySpy = sinon.stub(jobTypeModel, 'destroy').resolves(null);
          const bulkCreateSpy = sinon.stub(jobTypeModel, 'bulkCreate').resolves(null);

          req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/establishment/123/jobs',
            establishmentId: 123,
            username: 'adminUser',
            body: {
              [jobType]: [
                { jobId: 10, total: 2 },
                { jobId: 20, total: 3 },
              ],
            },
          });
          res = httpMocks.createResponse();

          await updateJobs(req, res);

          expect(res.statusCode).to.equal(200);

          expect(destroySpy).to.have.been.calledOnce;

          expect(bulkCreateSpy).to.have.been.calledOnce;
          expect(bulkCreateSpy.getCall(0).args[0]).to.deep.equal([
            {
              establishmentId: 123,
              jobId: 10,
              other: null,
              total: 2,
              type: jobTypeInCapital,
            },
            {
              establishmentId: 123,
              jobId: 20,
              other: null,
              total: 3,
              type: jobTypeInCapital,
            },
          ]);
        });
      });
    });
  });
});

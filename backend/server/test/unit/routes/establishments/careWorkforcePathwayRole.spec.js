const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../../models');
const {
  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer,
} = require('../../../../routes/establishments/careWorkforcePathway');

describe.only('careWorkforcePathwayRole', () => {
  afterEach(() => {
    sinon.restore();
  });

  const workersFromDB = [
    {
      id: 0,
      uid: 'tsw-0',
      NameOrIdValue: 'Test Worker 0',
      CareWorkforcePathwayRoleCategoryFK: null,
    },
    {
      id: 1,
      uid: 'tsw-1',
      NameOrIdValue: 'Test Worker 1',
      CareWorkforcePathwayRoleCategoryFK: null,
    },
    {
      id: 2,
      uid: 'tsw-2',
      NameOrIdValue: 'Test Worker 2',
      CareWorkforcePathwayRoleCategoryFK: null,
    },
  ];

  const establishmentId = 'some-uuid';

  const request = {
    method: 'GET',
    url: `/api/establishment/${establishmentId}/getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer`,
    params: {
      establishmentId,
    },
    establishmentId,
  };

  it('should return the number when there are workers with care workforce pathway category unanswered', async () => {
    sinon.stub(models.worker, 'getAllWorkersWithoutCareWorkforceCategory').returns(workersFromDB);

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response).to.deep.equal({noOfWorkersWhoRequireAnswers: workersFromDB.length});
  });

  it('should return 0 when there are no workers with care workforce pathway category unanswered', async () => {
    sinon.stub(models.worker, 'getAllWorkersWithoutCareWorkforceCategory').returns([]);

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response).to.deep.equal({noOfWorkersWhoRequireAnswers: 0});
  });

  it('should return an error', async () => {
    sinon.stub(models.worker, 'getAllWorkersWithoutCareWorkforceCategory').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

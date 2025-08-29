const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const buildUser = require('../../../../factories/user');
const Training = require('../../../../../models/classes/training').Training;
const Qualification = require('../../../../../models/classes/qualification').Qualification;
const { mockTrainingRecords } = require('../../../mockdata/training');
const { mockQualificationRecords } = require('../../../mockdata/qualifications');
const {
  hasAnyTrainingOrQualifications,
} = require('../../../../../routes/establishments/trainingAndQualifications/hasAnyTrainingOrQualifications');

describe.only('server/routes/establishments/trainingAndQualifications/hasAnyTrainingOrQualifications', () => {
  const user = buildUser();

  let req;
  let res;

  let mockTraining;
  let mockQualification;

  beforeEach(() => {
    const workerId = user.uid;

    const request = {
      method: 'GET',
      url: `/api/establishment/${user.establishmentId}/worker/${workerId}/trainingAndQualifications/hasAnyTrainingOrQualifications`,
    };

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();

    mockTraining = sinon.stub(Training, 'fetch');
    mockQualification = sinon.stub(Qualification, 'fetch');
    sinon.stub(console, 'error'); // supress error msg in test log
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should reply with a status of 200', async () => {
    mockTraining.returns({ count: mockTrainingRecords.length, training: mockTrainingRecords });
    mockQualification.returns(mockQualificationRecords);
    await hasAnyTrainingOrQualifications(req, res);

    expect(res.statusCode).to.deep.equal(200);
  });

  it('should return true when there is a training record and a qualification record', async () => {
    mockTraining.returns({ count: mockTrainingRecords.length, training: mockTrainingRecords });
    mockQualification.returns(mockQualificationRecords);

    await hasAnyTrainingOrQualifications(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal({ hasAnyTrainingOrQualifications: true });
  });

  it('should return true when there a training record but no qualification', async () => {
    mockTraining.returns({ count: mockTrainingRecords.length, training: mockTrainingRecords });
    mockQualification.returns({ ...mockQualificationRecords, count: 0 });

    await hasAnyTrainingOrQualifications(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal({ hasAnyTrainingOrQualifications: true });
  });

  it('should return true when there is no training record but there is a qualification record', async () => {
    mockTraining.returns({ count: 0 });
    mockQualification.returns(mockQualificationRecords);

    await hasAnyTrainingOrQualifications(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal({ hasAnyTrainingOrQualifications: true });
  });

  it('should return false when there are no training and qualifications', async () => {
    mockTraining.returns({ count: 0, training: mockTrainingRecords });
    mockQualification.returns({ ...mockQualificationRecords, count: 0 });
    await hasAnyTrainingOrQualifications(req, res);

    const response = res._getJSONData();

    expect(response).to.deep.equal({ hasAnyTrainingOrQualifications: false });
  });

  it('should return 500 when there is an unxpected error', async () => {
    mockTraining.throws();

    await hasAnyTrainingOrQualifications(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

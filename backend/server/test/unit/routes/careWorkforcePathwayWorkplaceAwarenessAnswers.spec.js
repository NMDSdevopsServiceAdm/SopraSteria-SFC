const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');

const {
  getAllCareWorkforcePathwayWorkplaceAwarenessAnswers,
} = require('../../../routes/careWorkforcePathwayWorkplaceAwarenessAnswers');

describe('careWorkforcePathwayWorkplaceAwarenessAnswers', () => {
  afterEach(() => {
    sinon.restore();
  });

  const request = {
    method: 'GET',
    url: `/api/getAllCareWorkforcePathwayWorkplaceAwarenessAnswers`,
  };

  const answers = [
    {
      id: 1,
      title: 'Aware of how the care workforce pathway works in practice',
      analysisFileCode: 1,
      bulkUploadCode: 1,
    },
    {
      id: 2,
      title: 'Aware of the aims of the care workforce pathway',
      analysisFileCode: 2,
      bulkUploadCode: 2,
    },
  ];

  const expectedAnswers = [
    {
      id: 1,
      title: 'Aware of how the care workforce pathway works in practice',
    },
    {
      id: 2,
      title: 'Aware of the aims of the care workforce pathway',
    },
  ];

  it('should return all the careWorkforcePathwayWorkplaceAwarenessAnswers', async () => {
    sinon.stub(models.careWorkforcePathwayWorkplaceAwareness, 'findAll').callsFake(() => {
        return answers
    })

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getAllCareWorkforcePathwayWorkplaceAwarenessAnswers(req, res)

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response.careWorkforcePathwayWorkplaceAwarenessAnswers).to.deep.equal(expectedAnswers);
  })

  it('should return an error', async () => {
    sinon.stub(models.careWorkforcePathwayWorkplaceAwareness, 'findAll').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getAllCareWorkforcePathwayWorkplaceAwarenessAnswers(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

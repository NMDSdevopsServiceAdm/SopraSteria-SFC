const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');

const { getAllCareWorkforcePathwayRoleCategories } = require('../../../routes/careWorkforcePathwayRoleCategories');

describe('careWorkforcePathwayRoleCategories', () => {
  afterEach(() => {
    sinon.restore();
  });

  const request = {
    method: 'GET',
    url: `/api/getAllCareWorkforcePathwayRoleCategories`,
  };

  const categories = [
    {
      id: 1,
      seq: 10,
      title: 'New to care',
      description: "Is in a care-providing role that's a start point for a career in social care",
      analysisFileCode: 1,
      bulkUploadCode: 1,
    },
    {
      id: 2,
      seq: 20,
      title: 'Care or support worker',
      description: "Is established in their role, they've consolidated their skills and experience",
      analysisFileCode: 2,
      bulkUploadCode: 2,
    },
  ];

  const expectedCategories = [
    {
      id: 1,
      title: 'New to care',
      description: "Is in a care-providing role that's a start point for a career in social care",
    },
    {
      id: 2,
      title: 'Care or support worker',
      description: "Is established in their role, they've consolidated their skills and experience",
    },
  ];

  it('should return all the careWorkforcePathwayRoleCategories', async () => {
    sinon.stub(models.careWorkforcePathwayRoleCategory, 'findAll').callsFake(() => {
      return categories;
    });

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getAllCareWorkforcePathwayRoleCategories(req, res);

    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response.careWorkforcePathwayRoleCategories).to.deep.equal(expectedCategories);
  });

  it('should return an error', async () => {
    sinon.stub(models.careWorkforcePathwayRoleCategory, 'findAll').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getAllCareWorkforcePathwayRoleCategories(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

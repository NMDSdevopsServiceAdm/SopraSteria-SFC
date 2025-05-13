const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const models = require('../../../models');

const { getAllCareWorkforcePathwayRoleCategories } = require('../../../routes/careWorkforcePathwayRoleCategories');
const { beforeEach } = require('node:test');

describe.only('careWorkforcePathwayRoleCategories', () => {
  let req
  let res
  let stubCareWorkforcePathwayRoleCategory

  const request = {
    method: 'GET',
    url: `/api/getAllCareWorkforcePathwayRoleCategories`,
  };

  const categories = [
    {
      id: 1,
      title: 'New to care',
        description: "Is in a care-providing role that's a start point for a career in social care",
    },
  ];

  beforeEach(() => {

  });


  afterEach(() => {
    sinon.restore();
  });


  it('should return all the careWorkforcePathwayRoleCategories', async () => {
    sinon.stub(models.careWorkforcePathwayRoleCategory, 'findAll').returns(categories);

    req = httpMocks.createRequest(request);
    res = httpMocks.createResponse();

    await getAllCareWorkforcePathwayRoleCategories(req, res);
    const response = res._getData();

    expect(res.statusCode).to.deep.equal(200);
    expect(response.careWorkforcePathwayRoleCategories).to.deep.equal(categories);
  });

  xit('should return an error', async () => {
    sinon.stub(models.careWorkforcePathwayRoleCategory, 'findAll').throws();

    const req = httpMocks.createRequest(request);
    const res = httpMocks.createResponse();
    await getAllCareWorkforcePathwayRoleCategories(req, res);

    expect(res.statusCode).to.deep.equal(500);
  });
});

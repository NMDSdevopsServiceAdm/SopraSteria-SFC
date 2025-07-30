const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const httpMocks = require('node-mocks-http');
const { getContentFromCms, CMS_URIS } = require('../../../../routes/cms');

describe('getContentFromCms', () => {
  let cmsGetCallMock;

  beforeEach(() => {
    cmsGetCallMock = sinon.stub(axios, 'get');
    CMS_URIS.dev = 'https://cms.dev.example.com';
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 and CMS data on success', async () => {
    const mockData = { data: { items: [{ title: 'Test Page' }] } };

    cmsGetCallMock.resolves(mockData);

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/cms/items/pages',
      query: {
        env: 'dev',
        filter: '{"slug":"home"}',
        fields: 'title,content',
      },
      params: {
        path: 'items/pages',
      },
    });

    const res = httpMocks.createResponse();

    await getContentFromCms(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).to.equal(200);
    expect(data).to.deep.equal(mockData.data);

    sinon.assert.calledWith(cmsGetCallMock, `${CMS_URIS.dev}/items/pages`, {
      params: {
        filter: '{"slug":"home"}',
        fields: 'title,content',
      },
    });
  });

  it('should return 400 if env is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
      params: { path: 'items/pages' },
    });

    const res = httpMocks.createResponse();

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res._getJSONData()).to.deep.equal({ error: 'Missing env' });
  });

  it('should return 400 if path is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { env: 'dev' },
      params: {},
    });

    const res = httpMocks.createResponse();

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res._getJSONData()).to.deep.equal({ error: 'Missing path' });
  });

  it('should return 400 if env is invalid', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { env: 'invalid' },
      params: { path: 'items/pages' },
    });

    const res = httpMocks.createResponse();

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res._getJSONData()).to.deep.equal({ error: 'Invalid environment specified' });
  });

  it('should return 500 if CMS fetch fails', async () => {
    cmsGetCallMock.rejects(new Error('Request failed'));

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {
        env: 'dev',
        filter: '{"slug":"home"}',
      },
      params: {
        path: 'items/pages',
      },
    });

    const res = httpMocks.createResponse();

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res._getJSONData()).to.deep.equal({ error: 'Failed to fetch content from CMS' });
  });
});

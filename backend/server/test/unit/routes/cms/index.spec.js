const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const httpMocks = require('node-mocks-http');
const { getContentFromCms, CMS_URIS } = require('../../../../routes/cms');
const cacheCMSModule = require('../../../../utils/cacheCMSReponse');

describe('getContentFromCms', () => {
  let cmsGetCallMock;
  let res;

  beforeEach(() => {
    cmsGetCallMock = sinon.stub(axios, 'get');
    CMS_URIS.dev = 'https://cms.dev.example.com';
    res = httpMocks.createResponse();

    sinon.stub(cacheCMSModule, 'cacheCMSResponse');
    sinon.stub(cacheCMSModule, 'getCMSResponseFromCache');
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

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res._getJSONData()).to.deep.equal({ error: 'Missing or invalid env' });
    expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
  });

  it('should return 400 if env is invalid', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { env: 'invalid' },
      params: { path: 'items/pages' },
    });

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(400);
    expect(res._getJSONData()).to.deep.equal({ error: 'Missing or invalid env' });
    expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
  });

  describe('Path sanitisation', () => {
    it('should return 400 if path is missing', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { env: 'dev' },
        params: {},
      });

      await getContentFromCms(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({ error: 'Missing or invalid path' });
      expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
    });

    it('should return 400 if path contains invalid characters', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { env: 'dev' },
        params: {
          path: 'items/pa<>ges',
        },
      });

      await getContentFromCms(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({
        error: 'Invalid characters in path',
      });
      expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
    });

    it('should return 400 if path contains literal ".." for traversal', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { env: 'dev' },
        params: {
          path: 'items/../../admin',
        },
      });

      await getContentFromCms(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({
        error: 'Invalid characters in path',
      });
    });

    it('should return 400 if path contains encoded ".." for traversal', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        query: { env: 'dev' },
        params: {
          path: 'items/%2e%2e/admin',
        },
      });

      await getContentFromCms(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res._getJSONData()).to.deep.equal({
        error: 'Invalid characters in path',
      });
      expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
    });
  });

  it('should return 500 with a special message if CMS fetch fails', async () => {
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

    await getContentFromCms(req, res);

    expect(res.statusCode).to.equal(500);
    expect(res._getJSONData()).to.deep.equal({ error: 'Failed to fetch content from CMS', action: 'NO_REDIRECT' });
    expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
  });

  describe('caching', () => {
    it('should cache the CMS content in redis when successful', async () => {
      const mockData = { data: { items: [{ title: 'Test Page' }] } };

      cmsGetCallMock.resolves(mockData);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cms/items/pages?filter=%7B%22slug%22%3A%22home%22%7D&fields=title%2Ccontent',
        query: {
          env: 'dev',
          filter: '{"slug":"home"}',
          fields: 'title,content',
        },
        params: {
          path: 'items/pages',
        },
      });

      await getContentFromCms(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).to.equal(200);
      expect(data).to.deep.equal(mockData.data);

      const expectedCmsUrl = '/cms/items/pages?filter=%7B%22slug%22%3A%22home%22%7D&fields=title%2Ccontent';

      expect(cacheCMSModule.cacheCMSResponse).to.have.been.deep.calledWith(expectedCmsUrl, mockData.data);
    });

    it('should respond with 200 and cached data if CMS API failed and there is cache data', async () => {
      const mockData = { data: { items: [{ title: 'Test Page' }] } };

      cmsGetCallMock.rejects(new Error('Request failed'));
      cacheCMSModule.getCMSResponseFromCache.resolves(mockData.data);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cms/items/pages?filter=%7B%22slug%22%3A%22home%22%7D&fields=title%2Ccontent',
        query: {
          env: 'dev',
          filter: '{"slug":"home"}',
          fields: 'title,content',
        },
        params: {
          path: 'items/pages',
        },
      });

      await getContentFromCms(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).to.equal(200);
      expect(data).to.deep.equal(mockData.data);

      const expectedCmsUrl = '/cms/items/pages?filter=%7B%22slug%22%3A%22home%22%7D&fields=title%2Ccontent';

      expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
      expect(cacheCMSModule.getCMSResponseFromCache).to.have.been.deep.calledWith(expectedCmsUrl);
    });

    it('should respond with 500 error if CMS API failed and no cache data available', async () => {
      cmsGetCallMock.rejects(new Error('Request failed'));
      cacheCMSModule.getCMSResponseFromCache.resolves(null);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cms/items/pages?filter=%7B%22slug%22%3A%22home%22%7D&fields=title%2Ccontent',
        query: {
          env: 'dev',
          filter: '{"slug":"home"}',
          fields: 'title,content',
        },
        params: {
          path: 'items/pages',
        },
      });

      await getContentFromCms(req, res);

      expect(res.statusCode).to.equal(500);

      expect(cacheCMSModule.cacheCMSResponse).not.to.have.been.called;
      expect(res._getJSONData()).to.deep.equal({ error: 'Failed to fetch content from CMS', action: 'NO_REDIRECT' });
    });
  });
});

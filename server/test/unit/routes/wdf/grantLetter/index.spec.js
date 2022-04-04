const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const httpMocks = require('node-mocks-http');
const models = require('../../../../../models');

const {
  generateDevelopmentFundGrantLetter,
} = require('../../../../../../server/routes/establishments/wdfClaims/generateDevelopmentFundGrantLetter');

describe('GrantLetter', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('generateDevelopmentFundGrant', () => {
    let axiosPostStub;
    let axiosGetStub;
    let saveWDFDataStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
      axiosGetStub = sinon.stub(axios, 'get');
      saveWDFDataStub = sinon.stub(models.DevelopmentFundGrants, 'saveWDFData');
      sinon.stub(models.establishment, 'getWDFClaimData').returns({
        address1: 'address',
        town: 'town',
        county: 'county',
        postcode: 'postcode',
        NameValue: 'org',
        IsNationalOrg: true,
      });
    });

    it('returns a 201 with an agreementId if agreement is successfully created', async () => {
      axiosPostStub.resolves({ data: { id: 'someid' } });
      axiosGetStub.resolves({
        data: { status: 'OUT_FOR_SIGNATURE', createdDate: '2022-03-31T15:43:32Z' },
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/wdf/developmentfund/agreements',
        body: { name: 'some name', email: 'some email', establishmentId: 1234 },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await generateDevelopmentFundGrantLetter(req, res, next);

      expect(res.statusCode).to.equal(201);
      expect(res._getJSONData()).to.eql({ agreementId: 'someid' });
    });

    it('saves the agreement data to the relevant table via the saveWDFData method', async () => {
      axiosPostStub.resolves({ data: { id: 'id-to-save-in-the-db' } });
      axiosGetStub.resolves({
        data: { status: 'OUT_FOR_SIGNATURE', createdDate: '2022-03-31T15:43:32Z' },
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/wdf/developmentfund/agreements',
        body: { name: 'some name', email: 'some email', establishmentId: 1234 },
      });
      const res = httpMocks.createResponse();
      const next = sinon.fake();

      await generateDevelopmentFundGrantLetter(req, res, next);

      expect(saveWDFDataStub).to.be.calledWith({
        agreementId: 'id-to-save-in-the-db',
        establishmentId: 1234,
        email: 'some email',
        name: 'some name',
        signStatus: 'OUT_FOR_SIGNATURE',
        createdDate: '2022-03-31T15:43:32Z',
      });
    });
  });
});

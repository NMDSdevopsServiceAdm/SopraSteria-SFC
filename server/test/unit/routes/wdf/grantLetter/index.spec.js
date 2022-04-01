const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const httpMocks = require('node-mocks-http');
const config = require('../../../../../config/config');
const models = require('../../../../../models');

const {
  createAgreement,
  queryAgreementStatus,
} = require('../../../../../../server/routes/wdf/developmentFundGrants/adobeSign');
const {
  generateDevelopmentFundGrantLetter,
} = require('../../../../../../server/routes/wdf/developmentFundGrants/generateDevelopmentFundGrantLetter');

describe('GrantLetter', () => {
  const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');

  describe('generateDevelopmentFundGrant', () => {
    let axiosPostStub;
    let axiosGetStub;
    sinon.stub(models.establishment, 'getWDFClaimData').returns({
      address1: 'address',
      town: 'town',
      county: 'county',
      postcode: 'postcode',
      NameValue: 'org',
      IsNationalOrg: true,
    });

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
      axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns a 201 with an agreementId if agreement is successfully created', async () => {
      axiosPostStub.resolves({ data: { id: 'someid' } });
      axiosGetStub.resolves({
        data: { status: 'OUT_FOR_SIGNATURE', createdDate: '2022-03-31T15:43:32Z' },
      });
      sinon.stub(models.DevelopmentFundGrants, 'saveWDFData');

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
      const saveWDFDataStub = sinon.stub(models.DevelopmentFundGrants, 'saveWDFData').callThrough();
      const dbStub = sinon.stub(models.DevelopmentFundGrants, 'create');

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
        signStatus: 'SENT',
        createdDate: '2022-03-31T15:43:32Z',
      });

      expect(dbStub).to.be.calledWith({
        AgreementID: 'id-to-save-in-the-db',
        EstablishmentID: 1234,
        ReceiverEmail: 'some email',
        ReceiverName: 'some name',
        SignStatus: 'SENT',
        DateSent: '2022-03-31T15:43:32Z',
      });
    });
  });

  describe('Adobe Sign Utils', () => {
    let axiosPostStub;
    let axiosGetStub;

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
      axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
      sinon.restore();
    });
    describe('createAgreement', () => {
      const data = {
        name: 'name',
        email: 'email',
        address: 'address',
        town: 'town',
        county: 'county',
        postcode: 'postcode',
        contractNumber: 'contractNumber',
        organisation: 'org',
        isNationalOrg: true,
      };
      const expectedAxiosCall = [
        `${adobeSignBaseUrl}/api/rest/v6/agreements`,
        {
          fileInfos: [
            {
              libraryDocumentId: config.get('adobeSign.directAccessDoc'),
            },
          ],
          participantSetsInfo: [
            {
              role: 'SIGNER',
              order: 1,
              memberInfos: [
                {
                  email: 'email',
                  name: 'name',
                },
              ],
            },
          ],
          signatureType: 'ESIGN',
          state: 'IN_PROCESS',
          status: 'OUT_FOR_SIGNATURE',
          name: 'Workplace Development Fund Grant Letter',
          mergeFieldInfo: [
            { defaultValue: 'name', fieldName: 'full_name' },
            { defaultValue: 'org', fieldName: 'organisation' },
            { defaultValue: 'address', fieldName: 'address' },
            { defaultValue: 'town', fieldName: 'town' },
            { defaultValue: 'county', fieldName: 'county' },
            { defaultValue: 'postcode', fieldName: 'postcode' },
            { defaultValue: 'contractNumber', fieldName: 'contract_number' },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.get('adobeSign.apiKey')}`,
          },
        },
      ];
      it('calls the adobe agreements endpoint with passed data and returns an ID for the agreement - Direct Access', async () => {
        const dataCopy = { ...data, isNationalOrg: false };
        axiosPostStub.resolves({ data: { id: 'an-id-goes-here' } });

        const response = await createAgreement(dataCopy);

        expect(response).to.eql({ id: 'an-id-goes-here' });
        expect(axiosPostStub).to.be.calledOnceWithExactly(...expectedAxiosCall);
      });

      it('calls the adobe agreements endpoint with passed data and returns an ID for the agreement - National Organisation', async () => {
        axiosPostStub.resolves({ data: { id: 'an-id-goes-here' } });
        expectedAxiosCall[1].fileInfos[0].libraryDocumentId = config.get('adobeSign.nationalOrgDoc');

        const response = await createAgreement(data);

        expect(response).to.eql({ id: 'an-id-goes-here' });
        expect(axiosPostStub).to.be.calledOnceWithExactly(...expectedAxiosCall);
      });

      it('returns an error if Adobe Sign rejects request', async () => {
        axiosPostStub.rejects(Error('something went wrong'));

        try {
          await createAgreement(data);
        } catch (err) {
          expect(err).to.be.an('Error');
          expect(err.message).to.equal('something went wrong');
        }
      });
    });

    describe('queryAgreementStatus', () => {
      it('returns the current status of a given agreement', async () => {
        axiosGetStub.resolves({ data: { status: 'SIGNED' } });

        const response = await queryAgreementStatus('agreement-id');

        expect(axiosGetStub).to.be.calledOnceWithExactly(`${adobeSignBaseUrl}/api/rest/v6/agreements/agreement-id`, {
          headers: {
            Authorization: `Bearer ${config.get('adobeSign.apiKey')}`,
          },
        });
        expect(response).to.include({ status: 'SIGNED' });
      });

      it('returns the error from Abode Sign API if there was an issue querying agreement', async () => {
        axiosGetStub.rejects(Error('something went wrong'));

        try {
          await queryAgreementStatus('agreement-id');
        } catch (err) {
          expect(err).to.be.an('Error');
          expect(err.message).to.equal('something went wrong');
        }

        expect(axiosGetStub).to.be.calledOnceWithExactly(`${adobeSignBaseUrl}/api/rest/v6/agreements/agreement-id`, {
          headers: {
            Authorization: `Bearer ${config.get('adobeSign.apiKey')}`,
          },
        });
      });
    });
  });
});

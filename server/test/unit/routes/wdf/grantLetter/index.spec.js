const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
// const httpMocks = require('node-mocks-http');
const config = require('../../../../../config/config');

const { generateToken, createAgreement } = require('../../../../../../server/routes/wdf/grantLetter/echoSign');

describe.only('GrantLetter', () => {
  const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');
  let axiosStub;

  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'post');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Adobe Signs Utils', () => {
    describe('generateToken', () => {
      it('returns the generated token from adobe sign', async () => {
        axiosStub.resolves({
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          api_access_point: 'https://api.eu2.adobesign.com/',
          web_access_point: 'https://secure.eu2.adobesign.com/',
          token_type: 'Bearer',
          expires_in: 3600,
        });

        const token = await generateToken();

        expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
        expect(token).to.equal('access_token');
      });

      it('returns a token error message if Adobe Sign fails to return a token', async () => {
        axiosStub.resolves({
          message: 'something wrong',
        });

        const output = await generateToken();

        expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
        expect(output.message).to.equal('token not returned');
      });

      it('returns error returned if Adobe Sign API call fails', async () => {
        axiosStub.rejects(Error('some error returned'));

        const output = await generateToken();

        expect(axiosStub).to.have.been.calledOnceWith(`${adobeSignBaseUrl}/oauth/v2/token`);
        expect(output.message).to.equal('some error returned');
      });
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
        partnershipName: 'partnership',
      };
      const expectedReturn = [
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
          name: 'name',
          mergeFieldInfo: [
            { defaultValue: 'name', fieldName: 'forename' },
            { defaultValue: 'name', fieldName: 'full_name' },
            { defaultValue: 'org', fieldName: 'organisation' },
            { defaultValue: 'partnership', fieldName: 'partnership_name' },
            { defaultValue: 'address', fieldName: 'address' },
            { defaultValue: 'town', fieldName: 'town' },
            { defaultValue: 'county', fieldName: 'county' },
            { defaultValue: 'postcode', fieldName: 'postcode' },
            { defaultValue: 'contractNumber', fieldName: 'contract_number' },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ADOBE_SIGN_KEY}`,
          },
        },
      ];
      it('calls the adobe agreements endpoint with passed data and returns an ID for the agreement - Direct Access', async () => {
        axiosStub.resolves({ id: 'an-id-goes-here' });
        const isNationalOrg = false;

        const output = await createAgreement(data, isNationalOrg);

        expect(output).to.eql({ id: 'an-id-goes-here' });
        expect(axiosStub).to.be.calledOnceWithExactly(...expectedReturn);
      });

      it('calls the adobe agreements endpoint with passed data and returns an ID for the agreement - National Organisation', async () => {
        axiosStub.resolves({ id: 'an-id-goes-here' });
        expectedReturn[1].fileInfos[0].libraryDocumentId = config.get('adobeSign.nationalOrgDoc');
        const isNationalOrg = true;

        const output = await createAgreement(data, isNationalOrg);

        expect(output).to.eql({ id: 'an-id-goes-here' });
        expect(axiosStub).to.be.calledOnceWithExactly(...expectedReturn);
      });

      it('returns an error if Adobe Sign rejects request', async () => {
        axiosStub.rejects(Error('something went wrong'));

        const output = await createAgreement(data);
        expect(output).to.be.an('Error');
        expect(output.message).to.equal('something went wrong');
      });
    });
  });
});

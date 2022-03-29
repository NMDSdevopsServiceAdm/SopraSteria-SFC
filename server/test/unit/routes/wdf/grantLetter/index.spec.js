const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
// const httpMocks = require('node-mocks-http');
const config = require('../../../../../config/config');

const { createAgreement, queryAgreementStatus } = require('../../../../../../server/routes/wdf/grantLetter/echoSign');

describe('GrantLetter', () => {
  const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');
  let axiosStub;

  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'post');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Adobe Signs Utils', () => {
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
        axiosStub.resolves({ data: { id: 'an-id-goes-here' } });
        const isNationalOrg = false;

        const response = await createAgreement(data, isNationalOrg);

        expect(response).to.eql({ id: 'an-id-goes-here' });
        expect(axiosStub).to.be.calledOnceWithExactly(...expectedReturn);
      });

      it('calls the adobe agreements endpoint with passed data and returns an ID for the agreement - National Organisation', async () => {
        axiosStub.resolves({ data: { id: 'an-id-goes-here' } });
        expectedReturn[1].fileInfos[0].libraryDocumentId = config.get('adobeSign.nationalOrgDoc');
        const isNationalOrg = true;

        const response = await createAgreement(data, isNationalOrg);

        expect(response).to.eql({ id: 'an-id-goes-here' });
        expect(axiosStub).to.be.calledOnceWithExactly(...expectedReturn);
      });

      it('returns an error if Adobe Sign rejects request', async () => {
        axiosStub.rejects(Error('something went wrong'));

        const response = await createAgreement(data);
        expect(response).to.be.an('Error');
        expect(response.message).to.equal('something went wrong');
      });
    });

    describe('queryAgreementStatus', () => {
      it('returns the current status of a given agreement', async () => {
        axiosStub.resolves({ data: { status: 'SIGNED' } });

        const response = await queryAgreementStatus('agreement-id');

        expect(axiosStub).to.be.calledOnceWithExactly(`${adobeSignBaseUrl}/api/rest/v6/agreements/agreement-id`, {
          headers: {
            Authorization: `Bearer ${process.env.ADOBE_SIGN_KEY}`,
          },
        });
        expect(response).to.include({ status: 'SIGNED' });
      });

      it('returns the error from Abode Sign API if there was an issue querying agreement', async () => {
        axiosStub.rejects(Error('something went wrong'));

        const response = await queryAgreementStatus('agreement-id');

        expect(axiosStub).to.be.calledOnceWithExactly(`${adobeSignBaseUrl}/api/rest/v6/agreements/agreement-id`, {
          headers: {
            Authorization: `Bearer ${process.env.ADOBE_SIGN_KEY}`,
          },
        });
        expect(response).to.be.an('Error');
        expect(response.message).to.equal('something went wrong');
      });
    });
  });
});

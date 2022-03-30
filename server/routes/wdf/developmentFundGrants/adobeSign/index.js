const config = require('../../../../config/config');
const axios = require('axios');

const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');
const adobeApiKey = config.get('adobeSign.apiKey');

module.exports.createAgreement = async (claimData) => {
  const { name, email, address, town, county, postcode, organisation, isNationalOrg } = claimData;
  const body = {
    fileInfos: [
      {
        libraryDocumentId: config.get(`${isNationalOrg ? 'adobeSign.nationalOrgDoc' : 'adobeSign.directAccessDoc'}`),
      },
    ],
    participantSetsInfo: [
      {
        role: 'SIGNER',
        order: 1,
        memberInfos: [
          {
            email,
            name,
          },
        ],
      },
    ],
    signatureType: 'ESIGN',
    state: 'IN_PROCESS',
    status: 'OUT_FOR_SIGNATURE',
    name: 'Workplace Development Fund Grant Letter', // title of the agreement
    mergeFieldInfo: [
      {
        defaultValue: name.split(' ')[0],
        fieldName: 'forename',
      },
      {
        defaultValue: name,
        fieldName: 'full_name',
      },
      {
        defaultValue: organisation,
        fieldName: 'organisation',
      },
      {
        defaultValue: address,
        fieldName: 'address',
      },
      {
        defaultValue: town,
        fieldName: 'town',
      },
      {
        defaultValue: county,
        fieldName: 'county',
      },
      {
        defaultValue: postcode,
        fieldName: 'postcode',
      },
      {
        defaultValue: 'contractNumber',
        fieldName: 'contract_number',
      },
    ],
  };

  return axios
    .post(`${adobeSignBaseUrl}/api/rest/v6/agreements`, body, {
      headers: {
        Authorization: `Bearer ${adobeApiKey}`,
      },
    })
    .then(({ data }) => data)
    .catch((err) => {
      throw err;
    });
};

module.exports.queryAgreementStatus = async (agreementId) => {
  return axios
    .get(`${adobeSignBaseUrl}/api/rest/v6/agreements/${agreementId}`, {
      headers: {
        Authorization: `Bearer ${adobeApiKey}`,
      },
    })
    .then(({ data }) => data)
    .catch((err) => {
      throw err;
    });
};

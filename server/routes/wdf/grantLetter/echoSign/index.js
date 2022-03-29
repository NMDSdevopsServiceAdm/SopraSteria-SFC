const config = require('../../../../config/config');
const axios = require('axios');

const adobeSignBaseUrl = config.get('adobeSign.apiBaseUrl');

module.exports.generateToken = async () => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
  });
  const axiosConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  return axios
    .post(`${adobeSignBaseUrl}/oauth/v2/token`, body, axiosConfig)
    .then((response) => {
      if (!response['access_token']) throw new Error('token not returned');
      return response['access_token'];
    })
    .catch((err) => {
      return err;
    });
};

module.exports.createAgreement = async (claimData, isNationalOrg) => {
  const { name, email, address, town, county, postcode, contractNumber, organisation, partnershipName } = claimData;
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
            email: email,
            name: name,
          },
        ],
      },
    ],
    signatureType: 'ESIGN',
    state: 'IN_PROCESS',
    status: 'OUT_FOR_SIGNATURE',
    name,
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
        defaultValue: partnershipName,
        fieldName: 'partnership_name',
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
        defaultValue: contractNumber,
        fieldName: 'contract_number',
      },
    ],
  };

  return axios
    .post(`${adobeSignBaseUrl}/api/rest/v6/agreements`, body, {
      headers: {
        Authorization: `Bearer ${process.env.ADOBE_SIGN_KEY}`,
      },
    })
    .then((response) => response)
    .catch((err) => err);
};

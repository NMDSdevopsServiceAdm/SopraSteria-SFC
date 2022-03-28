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

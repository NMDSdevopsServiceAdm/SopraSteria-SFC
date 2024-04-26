const config = require('../../config/config');

const jwt = require('jsonwebtoken');

exports.generateAccessToken = () => {
  const payload = {
    nhsBsaApiKey: config.get('nhsBsaApi.apikey'),
  };

  const nhsBsaSecret = config.get('jwt.nhsBsaSecret');

  const ttlHour = { expiresIn: '24h' }; // expires in 24 hours

  return jwt.sign(payload, nhsBsaSecret, ttlHour);
};

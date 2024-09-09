const express = require('express');
const router = express.Router();
const generateJWT = require('../../utils/security/NHSBSAgenerateJWT');
const config = require('../../config/config');
const { nhsBsaApiLimiter } = require('../../utils/middleware/rateLimitingNHSBSAAPI');

router.use('/', nhsBsaApiLimiter);
router.route('/').get(function (req, res) {
  const authHeader = req.headers && req.headers.nhsbsaapikey;
  const nhsBsaApiKey = config.get('nhsBsaApi.apikey');

  if (authHeader !== nhsBsaApiKey) return res.status(401).json({ error: 'Invalid Key' });

  try {
    const token = generateJWT.generateAccessToken();
    res.status(200).json({
      access_token: token,
      expiresIn: '24h',
    });
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

module.exports = router;

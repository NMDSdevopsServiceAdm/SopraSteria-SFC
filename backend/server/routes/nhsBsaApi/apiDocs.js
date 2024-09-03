const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authLimiter } = require('../../utils/middleware/rateLimiting');

const nhsBsaApiDocumentation = (req, res) => {
  try {
    const filePath = path.join(__dirname, 'docs/wds-api.yaml');
    const data = fs.readFileSync(filePath, 'utf8');

    res.setHeader('Content-Type', 'application/x-yaml');
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

router.route('/').get(authLimiter, nhsBsaApiDocumentation);
module.exports = router;
module.exports.nhsBsaApiDocumentation = nhsBsaApiDocumentation;

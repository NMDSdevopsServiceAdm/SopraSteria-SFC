const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authorization = require('../../utils/middleware/isNHSBSAAuthenticated');
const { authLimiter } = require('../../utils/middleware/rateLimitingNHSBSAAPI');

const nhsBsaApiDocumentation = async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'docs/wds-api.yaml');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading YAML file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      res.setHeader('Content-Type', 'application/x-yaml');
      res.status(200);
      res.send(data);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(authLimiter, authorization.isAuthorised, nhsBsaApiDocumentation);
module.exports = router;
module.exports.nhsBsaApiDocumentation = nhsBsaApiDocumentation;

// Daily Snapshot Report
const config = require('../../../config/config');
const thisIss = config.get('jwt.iss');
const express = require('express');
const router = express.Router();
const models = require('../../../models');

// this util middleware will block if the given request is not authorised
const jwt = require('jsonwebtoken');
const getToken = (headers) => {
  if (headers) {
    let token = headers;
    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
    return token;
  }
  return null;
};

const isAuthorised = (req, res, next) => {
  const AUTH_HEADER = 'authorization';
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== 'ADS-WDS-on-demand-reporting' || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/', isAuthorised);
router.route('/').get(async (req, res) => {
  req.setTimeout(15 * 60 * 1000); // fifteen minutes
  try {
    // rather than define a sequelize model, instead, simply query directly upon a view
    // NOTE - the order of the records is defined by the view
    const dailySnapshotResults = await models.sequelize.query('select * from cqc."AllEstablishmentAndWorkersVW"', {
      type: models.sequelize.QueryTypes.SELECT,
    });

    if (dailySnapshotResults && Array.isArray(dailySnapshotResults)) {
      return res.status(200).json(dailySnapshotResults);
    } else {
      // unexpected
      return res.status(503).send();
    }
  } catch (err) {
    console.error('report/dailySnapshot - failed', err);
    return res.status(503).send();
  }
});

module.exports = router;

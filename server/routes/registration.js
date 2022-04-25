const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const isLocal = require('../utils/security/isLocalTest').isLocal;
const { registerAccount } = require('./registration/registerAccount');
const models = require('../models');

const generateJWT = require('../utils/security/generateJWT');
const sendMail = require('../utils/email/notify-email').sendPasswordReset;
const { authLimiter } = require('../utils/middleware/rateLimiting');

router.use('/establishmentExistsCheck', require('./registration/establishmentExistsCheck'));

// Check if service exists
router.get('/service/:name', async (req, res) => {
  const requestedServiceName = req.params.name;
  try {
    const results = await models.services.findOne({
      where: {
        name: requestedServiceName,
      },
    });

    if (results && results.id && requestedServiceName === results.name) {
      return res.status(200).json({
        status: '1',
        message: `Service name '${requestedServiceName}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Service name '${requestedServiceName}' not found`,
      });
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET service/:name - failed', err);
    return res.status(500).send(`Unable to retrive service by name: ${escape(requestedServiceName)}`);
  }
});

router.get('/username', (req, res) => {
  // this is a false trap for empty username lookup requests from the UI
  return res.status(200).json({
    status: '0',
    message: 'Username not found',
  });
});

router.use('/username/:username', authLimiter);
router.get('/username/:username', async (req, res) => {
  const requestedUsername = req.params.username.toLowerCase();
  try {
    const results = await models.login.findOne({
      where: {
        username: {
          [models.Sequelize.Op.iLike]: requestedUsername,
        },
      },
    });

    req.sqreen.track('app.username_lookup');

    if (results && results.id && requestedUsername === results.username) {
      return res.status(200).json({
        status: '1',
        message: `Username '${requestedUsername}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Username '${requestedUsername}' not found`,
      });
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET username/:username - failed', err);
    return res.json({
      status: '0',
      message: `Username '${requestedUsername}' not found`,
    });
  }
});

router.get('/usernameOrEmail/:usernameOrEmail', async (req, res) => {
  const requestedUsernameOrEmail = req.params.usernameOrEmail.toLowerCase();

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const loginResults = await models.login.findOne({
      where: {
        username: {
          [models.Sequelize.Op.iLike]: requestedUsernameOrEmail,
        },
      },
    });
    const userResults = await models.user.findOne({
      where: {
        EmailValue: {
          [models.Sequelize.Op.iLike]: requestedUsernameOrEmail,
        },
      },
    });

    if (
      (loginResults && loginResults.id && requestedUsernameOrEmail === loginResults.username) ||
      (userResults && userResults.id && requestedUsernameOrEmail === userResults.EmailValue)
    ) {
      return res.status(200).send();
    } else {
      return res.status(404).send();
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET /usernameOrEmail/:usernameOrEmail - failed', err);
    return res.status(500).send();
  }
});

router.get('/estbname/:name', async (req, res) => {
  const requestedEstablishmentName = req.params.name;

  try {
    const results = await models.establishment.findOne({
      where: {
        NameValue: requestedEstablishmentName,
      },
    });

    if (results && results.id && requestedEstablishmentName === results.NameValue) {
      return res.status(200).json({
        status: '1',
        message: `Establishment by name '${requestedEstablishmentName}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Establishment by name '${requestedEstablishmentName}' not found`,
      });
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET estbname/:name - failed', err);
    return res.json({
      status: '0',
      message: `Establishment by name '${requestedEstablishmentName}' not found`,
    });
  }
});

router.get('/estb/:name/:locationid', async (req, res) => {
  const requestedEstablishmentName = req.params.name;
  const requestedEstablishmentLocationId = req.params.locationid;
  try {
    const results = await models.establishment.findOne({
      where: {
        NameValue: requestedEstablishmentName,
        locationId: requestedEstablishmentLocationId,
      },
    });

    if (results && results.id && requestedEstablishmentName === results.NameValue) {
      return res.status(200).json({
        status: '1',
        message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' found`,
      });
    } else {
      return res.status(200).json({
        status: '0',
        message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' not found`,
      });
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration GET /estb/:name&:locationid - failed', err);
    return res.json({
      status: '0',
      message: `Establishment by name '${requestedEstablishmentName}' and by location id '${requestedEstablishmentLocationId}' not found`,
    });
  }
});

router
  .route('/')
  .get((req, res) => {
    res.json({
      status: 'API id Working',
      message: 'Registration API',
    });
  })

  .post(registerAccount);

router.post('/requestPasswordReset', async (req, res) => {
  // parse input - escaped to prevent SQL injection
  if (!req.body.usernameOrEmail) {
    return res.status(400).send();
  }
  const givenEmailOrUsername = escape(req.body.usernameOrEmail.toLowerCase());

  // for automated testing, allow the expiry to be overridden by a given TTL parameter (in seconds)
  //  only for localhost/dev
  const expiresTTLms = isLocal(req) && req.body.ttl ? parseInt(req.body.ttl) * 1000 : 60 * 60 * 24 * 1000; // 24 hours

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const loginResults = await models.login.findOne({
      attributes: ['id', 'username'],
      where: {
        username: {
          [models.Sequelize.Op.iLike]: givenEmailOrUsername,
        },
        isActive: true,
        status: null,
      },
      include: [
        {
          model: models.user,
          attributes: ['EmailValue', 'FullNameValue', 'id'],
        },
      ],
    });
    const userResults = await models.user.findAll({
      attributes: ['EmailValue', 'FullNameValue', 'id'],
      where: {
        EmailValue: {
          [models.Sequelize.Op.iLike]: givenEmailOrUsername,
        },
      },
      include: [
        {
          model: models.login,
          attributes: ['id', 'username'],
          where: {
            isActive: true,
            status: null,
          },
        },
      ],
    });

    if (
      (loginResults && loginResults.id && givenEmailOrUsername === loginResults.username) ||
      (userResults && userResults.length === 1 && givenEmailOrUsername === userResults[0].EmailValue)
    ) {
      let sendToAddress = null,
        sendToName = null,
        userRegistrationId = null;
      if (userResults && userResults.length === 1 && userResults[0].EmailValue) {
        sendToAddress = userResults[0].EmailValue;
        sendToName = userResults[0].FullNameValue;
        userRegistrationId = userResults[0].id;
      } else if (loginResults && loginResults.user && loginResults.user.EmailValue) {
        sendToAddress = loginResults.user.EmailValue;
        sendToName = loginResults.user.FullNameValue;
        userRegistrationId = loginResults.user.id;
      }

      if (sendToAddress === null || sendToName === null || userRegistrationId === null) {
        throw new Error(
          `Unexpected error: failed to retrieve registration ID/name/email address (${givenEmailOrUsername}) on either user or login`,
        );
      }

      const requestUuid = uuid.v4();
      const now = new Date();
      const expiresIn = new Date(now.getTime() + expiresTTLms);

      await models.passwordTracking.create({
        userFk: userRegistrationId,
        created: now.toISOString(),
        expires: expiresIn.toISOString(),
        uuid: requestUuid,
      });

      // send email to recipient with the reset UUID
      await sendMail(sendToAddress, sendToName, requestUuid);

      req.sqreen.track('app.reset_password_request', {
        userId: userResults.uid,
      });

      return res.status(200).send();
    } else {
      // non-disclosure - if account is not found, return 200 anyway - suggesting that an email has been found
      return res.status(200).send();
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration POST /requestPasswordReset - failed', err);
    return res.status(500).send();
  }
});

router.post('/validateResetPassword', async (req, res) => {
  if (!req.body.uuid) {
    console.error('No UUID');
    return res.status(400).send();
  }
  // parse input - escaped to prevent SQL injection
  const givenUuid = escape(req.body.uuid);
  const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

  if (!uuidV4Regex.test(givenUuid)) {
    console.error('Invalid UUID');
    return res.status(400).send();
  }

  try {
    // username is on Login table, but email is on User table. Could join, but it's just as east to fetch each individual
    const passTokenResults = await models.passwordTracking.findOne({
      where: {
        uuid: givenUuid,
      },
    });

    if (passTokenResults && passTokenResults.id) {
      // now check if the token has expired or already been consumed
      const now = new Date().getTime();
      if (passTokenResults.expires.getTime() < now) {
        console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) expired`);
        return res.status(403).send();
      }

      if (passTokenResults.completed) {
        console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) has already been used`);
        return res.status(403).send();
      }

      // gets this far if the token is valid. Generate a JWT, which requires knowing the associated User/Login details.
      const userResults = await models.user.findOne({
        where: {
          id: passTokenResults.userFk,
        },
        include: [
          {
            model: models.login,
            attributes: ['username'],
          },
        ],
      });

      if (userResults && userResults.id && userResults.id === passTokenResults.userFk) {
        // generate JWT and attach it to the header (Authorization)
        const JWTexpiryInMinutes = 15;
        const token = generateJWT.passwordResetJWT(
          JWTexpiryInMinutes,
          userResults.login.username,
          userResults.FullNameValue,
          givenUuid,
        );

        res.set({
          Authorization: 'Bearer ' + token,
        });

        return res.status(200).json({
          username: userResults.login.username,
          fullname: userResults.FullNameValue,
        });
      } else {
        throw new Error(`Failed to find user matching reset token (${givenUuid})`);
      }
    } else {
      // token not found
      console.error(`registration POST /validateResetPassword - reset token (${givenUuid}) not found`);
      return res.status(404).send();
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('registration POST /validateResetPassword - failed', err);
    return res.status(500).send();
  }
});

module.exports = router;

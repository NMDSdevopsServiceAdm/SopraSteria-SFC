const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';
const thisIss = config.get('jwt.iss');
const models = require('../../models');
const Sentry = require('@sentry/node');
const { isAdminRole } = require('../adminUtils');

const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

const getTokenSecret = () => {
  return config.get('jwt.secret');
};

// this util middleware will block if the given request is not authorised
const isAuthorised = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username = claim.sub;
        req.userUid = claim.userUid;
        req.user = {
          id: claim.userUid,
        };
        req.role = claim.role;
        req.isParent = claim.isParent;
        req.establishment = {
          id: claim.EstblishmentId,
          uid: claim.hasOwnProperty('EstablishmentUID') ? claim.EstablishmentUID : null,
        };
        req.establishmentId = claim.EstblishmentId;

        Sentry.setUser({
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        });

        Sentry.setContext('establishment', {
          id: req.establishment.id,
          uid: req.establishment.uid,
          isParent: req.isParent,
        });

        Sentry.setContext('user', {
          username: req.username,
          id: req.userUid,
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          role: req.role,
        });

        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const authorisedEstablishmentPermissionCheck = async (req, res, next, roleCheck) => {
  try {
    const token = getToken(req.headers[AUTH_HEADER]);
    const Token_Secret = config.get('jwt.secret');

    if (token) {
      await checkAuthorisation(req, res, next, roleCheck, token, Token_Secret);
    } else {
      // not authenticated
      res.status(401).send('Requires authorisation');
    }
  } catch (err) {
    return sendForbidden(req, res, err);
  }
};

const audOrISSInvalid = (claim, thisIss) => claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss;

const isEstablishmentIDNaN = (claim) => !claim.EstblishmentId || isNaN(parseInt(claim.EstblishmentId));

const isEstablishmentUIDInvalid = (claim) => !claim.EstablishmentUID || !uuidV4Regex.test(claim.EstablishmentUID);

const establishmentIDorUIDIsInvalid = (claim) => isEstablishmentIDNaN(claim) || isEstablishmentUIDInvalid(claim);

const isEstablishmentIdUID = (req) => uuidV4Regex.test(req.params.id);

const isReadOnlyTryingToNotGET = (roleCheck, req, claim) => roleCheck && req.method !== 'GET' && claim.role == 'Read';

const subsidaryEstablishmentClaimMismatch = (establishmentMatchesClaim, claim) =>
  !establishmentMatchesClaim && !claim.isParent;

const reqMatchClaimEstablishment = (establishmentIdIsUID, req, claim) => {
  if (establishmentIdIsUID && claim.EstablishmentUID === req.params.id) {
    req.establishmentId = claim.EstablishmentUID;
    return true;
  }

  if (claim.EstblishmentId === parseInt(req.params.id)) {
    req.establishmentId = claim.EstblishmentId;
    return true;
  }
  return false;
};

const setSentryContexts = (req, referencedEstablishment) => {
  Sentry.setUser({
    username: req.username,
    id: req.userUid,
    ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  });

  Sentry.setContext('establishment', {
    id: req.establishment.id,
    uid: req.establishment.uid,
    isParent: req.isParent,
    nmdsID: referencedEstablishment.nmdsId,
  });

  Sentry.setContext('user', {
    username: req.username,
    id: req.userUid,
    ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    role: req.role,
  });
};

const handleExceptions = (req, res, claim, establishmentMatchesClaim, roleCheck) => {
  if (audOrISSInvalid(claim, thisIss)) {
    return sendForbidden(req, res, { name: 'Invalid aud or ISS' });
  }

  if (establishmentIDorUIDIsInvalid(claim)) {
    console.error('hasAuthorisedEstablishment - missing establishment id or uid parameter');
    return res.status(400).send('Unknown Establishment');
  }

  if (subsidaryEstablishmentClaimMismatch(establishmentMatchesClaim, claim)) {
    console.error(
      `hasAuthorisedEstablishment - given and known establishment id do not match: given (${req.params.id})/known (${claim.EstblishmentId}/${claim.EstablishmentUID})`,
    );
    return res.status(403).send(`Not permitted to access Establishment with id: ${escape(req.params.id)}`);
  }

  if (isReadOnlyTryingToNotGET(roleCheck, req, claim)) {
    return res.status(403).send({ message: 'Not permitted' });
  }
};

const parentNoWriteAccess = (req) => req.method !== 'GET' && req.path.split('/')[1] !== 'ownershipChange';

const noDataPermissions = (referencedEstablishment) => referencedEstablishment.dataPermissions === null;

const noEstablishmentMatchButParent = (establishmentMatchesClaim, claim) =>
  !establishmentMatchesClaim && claim.isParent;

const isNotAdminButWorkplaceIsDataOwner = (claim, referencedEstablishment) =>
  !isAdminRole(claim.role) && referencedEstablishment.dataOwner === 'Workplace';

const noDataPermissionsOrNoParentWriteAccess = (referencedEstablishment, req) =>
  noDataPermissions(referencedEstablishment) || parentNoWriteAccess(req);

const parentButNoPermissions = (establishmentMatchesClaim, referencedEstablishment, claim, req) =>
  noEstablishmentMatchButParent(establishmentMatchesClaim, claim) &&
  isNotAdminButWorkplaceIsDataOwner(claim, referencedEstablishment) &&
  noDataPermissionsOrNoParentWriteAccess(referencedEstablishment, req);

const handleParentPermissionsExceptions = (req, res, claim, referencedEstablishment, establishmentMatchesClaim) => {
  if (parentButNoPermissions(establishmentMatchesClaim, referencedEstablishment, claim, req)) {
    console.error(
      `Found subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID}), but access has not been given`,
    );
    return res
      .status(403)
      .send({ message: `Parent not permitted to access/update Establishment with id: ${req.params.id}` });
  }
};

const buildRequest = (req, claim, referencedEstablishment) => {
  req.username = claim.sub;
  req.userUid = claim.userUid;
  req.user = {
    id: claim.userUid,
  };
  req.isParent = claim.isParent;
  req.role = claim.role;
  req.establishment = {
    id: claim.EstblishmentId,
    uid: claim.EstablishmentUID,
  };

  if (!referencedEstablishment) return;

  req.establishmentId = referencedEstablishment.id;
  req.dataPermissions = referencedEstablishment.dataPermissions;
  req.parentIsOwner = referencedEstablishment.dataOwner === 'Parent' ? true : false;

  req.establishment.isSubsidiary = referencedEstablishment.parentId !== null;
  req.establishment.isParent = referencedEstablishment.parentId === null && referencedEstablishment.isParent;
};

const checkAuthorisation = async (req, res, next, roleCheck, token, Token_Secret) => {
  const claim = jwt.verify(token, Token_Secret);
  const establishmentIdIsUID = isEstablishmentIdUID(req);
  const establishmentMatchesClaim = reqMatchClaimEstablishment(establishmentIdIsUID, req, claim);

  const exceptionReturned = handleExceptions(req, res, claim, establishmentMatchesClaim, roleCheck);
  if (exceptionReturned) return exceptionReturned;

  try {
    const where = {};
    if (!establishmentMatchesClaim && claim.isParent) where.parentId = claim.EstblishmentId;
    establishmentIdIsUID ? (where.uid = req.params.id) : (where.id = req.params.id);

    const referencedEstablishment = await models.establishment.authenticateEstablishment(where);

    const parentPermissionExceptionReturned = handleParentPermissionsExceptions(
      req,
      res,
      claim,
      referencedEstablishment,
      establishmentMatchesClaim,
    );
    if (parentPermissionExceptionReturned) return parentPermissionExceptionReturned;

    buildRequest(req, claim, referencedEstablishment);
    setSentryContexts(req, referencedEstablishment);

    return next();
  } catch (err) {
    // failed to find establishment by UUID - being a subsidairy of this known parent
    console.error(
      `Failed to find subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID})`,
    );
    return res.status(403).send(`Not permitted to access Establishment with id: ${escape(req.params.id)}`);
  }
};

const sendForbidden = (_req, res, err) => {
  console.error('hasAuthorisedEstablishment: caught err: ', err.name, err);
  return res.status(403).send({
    success: false,
    message: err.name && err.name === 'TokenExpiredError' ? 'token expired' : 'token is invalid',
  });
};

const hasAuthorisedEstablishmentAllowAllRoles = async (req, res, next) => {
  authorisedEstablishmentPermissionCheck(req, res, next, false);
};

const hasAuthorisedEstablishment = async (req, res, next) => {
  authorisedEstablishmentPermissionCheck(req, res, next, true);
};

const getToken = function (headers) {
  if (headers) {
    let token = headers;

    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
    return token;
  }
  return null;
};

const isAuthorisedPasswdReset = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      // can be either a password reset token or a logged in token

      if (err || claim.aud !== config.get('jwt.aud.passwordReset') || claim.iss !== thisIss) {
        console.error('Password reset token is invalid');
        return res.status(403).send('Invalid token');
      } else {
        // extract token claims and add to the request for subsequent use
        req.resetUuid = claim.resetUUID;
        req.username = claim.sub;
        req.fullname = claim.name;
        req.user = {
          id: claim.userUid,
        };
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAuthorisedAddUser = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      // can be either a password reset token or a logged in token

      if (err || claim.aud !== config.get('jwt.aud.addUser') || claim.iss !== thisIss) {
        console.error('Add User token is invalid');
        return res.status(403).send('Invalid token');
      } else {
        // extract token claims and add to the request for subsequent use
        req.addUserUUID = claim.addUserUUID;
        req.userUID = claim.sub;
        req.fullname = claim.name;
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAuthorisedInternalAdminApp = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.internalAdminApp') || claim.iss !== thisIss) {
        console.error('Internal Admin App token is invalid');
        return res.status(403).send('Invalid token');
      } else {
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAdmin = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    // var dec = getverify(token, Token_Secret);
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        if (!isAdminRole(claim.role)) {
          return res.status(403).send("You're not admin");
        } else {
          req.username = claim.sub;
          req.role = claim.role;
          req.userUid = claim.userUid;
          req.user = {
            id: claim.userUid,
          };
          req.establishment = {
            id: null,
            uid: null,
          };
          next();
        }
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAdminManager = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      console.log('****** is Admin Manager ******');
      console.log(claim);
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        if (claim.role !== 'AdminManager') {
          return res.status(403).send("You're not an admin manager");
        } else {
          req.username = claim.sub;
          req.role = claim.role;
          req.userUid = claim.userUid;
          req.user = {
            id: claim.userUid,
          };
          req.establishment = {
            id: null,
            uid: null,
          };
          next();
        }
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAuthorisedRegistrationApproval = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.internalAdminApp') || claim.iss !== thisIss) {
        console.error('Internal Admin App token is invalid');
        return res.status(403).send('Invalid token');
      } else {
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

const isAdminOrOnDemandReporting = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      const isAdmin = !err
        ? claim.aud === config.get('jwt.aud.login') && isAdminRole(claim.role)
          ? true
          : false
        : false;
      const isOnDemandReport = !err ? (claim.aud === 'ADS-WDS-on-demand-reporting' ? true : false) : false;

      if (err || !(isAdmin || isOnDemandReport) || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username = claim.sub;
        req.userUid = claim.userUid;
        req.user = {
          id: claim.userUid,
        };
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('isAdminOrOnDemandReporting - Requires authorisation');
  }
};

exports.getTokenSecret = getTokenSecret;
exports.isAuthorised = isAuthorised;
exports.hasAuthorisedEstablishmentAllowAllRoles = hasAuthorisedEstablishmentAllowAllRoles;
exports.hasAuthorisedEstablishment = hasAuthorisedEstablishment;
exports.isAuthorisedPasswdReset = isAuthorisedPasswdReset;
exports.isAuthorisedAddUser = isAuthorisedAddUser;
exports.isAuthorisedInternalAdminApp = isAuthorisedInternalAdminApp;
exports.isAdmin = isAdmin;
exports.isAdminManager = isAdminManager;
exports.isAuthorisedRegistrationApproval = isAuthorisedRegistrationApproval;
exports.isAdminOrOnDemandReporting = isAdminOrOnDemandReporting;
exports.authorisedEstablishmentPermissionCheck = authorisedEstablishmentPermissionCheck;

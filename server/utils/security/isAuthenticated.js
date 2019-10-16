const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';
const thisIss = config.get('jwt.iss');
const models = require('../../models');

exports.getTokenSecret = () => {
  return config.get('jwt.secret');
}

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
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
        req.role = claim.role;
        req.isParent = claim.isParent;
        req.establishment = {
          id: claim.EstblishmentId,
          uid: claim.hasOwnProperty('EstablishmentUID') ? claim.EstablishmentUID : null
        };
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

authorisedEstablishmentPermissionCheck = async (req, res, next, roleCheck) => {
  try {
    const token = getToken(req.headers[AUTH_HEADER]);
    const Token_Secret = config.get('jwt.secret');

    // console.log("WA DEBUG - hasAuthorisedEstablishment token: ", token, Token_Secret)
    if (token) {
      const claim = jwt.verify(token, Token_Secret);

      // console.log("WA DEBUG - hasAuthorisedEstablishment token claims: ", claim)

      if (claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send({
          sucess: false,
          message: 'token is invalid'
        });
      } else {

        // must provide the establishment ID/UID
        if (!claim.EstblishmentId || isNaN(parseInt(claim.EstblishmentId))) {
          console.error('hasAuthorisedEstablishment - missing establishment id parameter');
          return res.status(400).send(`Unknown Establishment ID`);
        }
        const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
        if (!claim.EstablishmentUID || !uuidV4Regex.test(claim.EstablishmentUID)) {
          console.error('hasAuthorisedEstablishment - missing establishment uid parameter');
          return res.status(400).send(`Unknown Establishment UID`);
        }

        // the given parameter could be a UUID or integer - first authorised against known primary establishment
        let establishmentIdIsUID = false;
        let isAuthorised = false;
        if (uuidV4Regex.test(req.params.id)) {
          // establishment id in params is a UUID - tests against UID in claim
          establishmentIdIsUID = true;
          if (claim.EstablishmentUID === req.params.id) {
            req.establishmentId=claim.EstablishmentUID;
            isAuthorised = true;
          }
        } else {
          if (claim.EstblishmentId === parseInt(req.params.id)) {
            req.establishmentId = claim.EstblishmentId;
            isAuthorised = true;
          }
        }

        //console.log("WA DEBUG - hasAuthorisedEstablishment: ", isAuthorised, claim.isParent)

        // if still not authorised - and only if this user is attributed to a parent establishment
        //  then follow up by checking against any of the known subsidaries of this parent establishment
        //  including that of the given establishment (only known by it's UID)

        if (isAuthorised === false && claim.isParent) {

          try {
            let findEstablishmentWhereClause = {
              parentId: claim.EstblishmentId,
            };

            if (establishmentIdIsUID) {
              findEstablishmentWhereClause.uid = req.params.id;
            } else {
              findEstablishmentWhereClause.id = req.params.id;
            }

            const referencedEstablishment = await models.establishment.findOne({
              attributes: ['id', 'dataPermissions', 'dataOwner', 'parentId'],
              where: findEstablishmentWhereClause
            });
            // this is a known subsidairy of this given parent establishment

            // but, to be able to access the subsidary, then the permissions must not be null
            if (claim.role != 'Admin' && referencedEstablishment.dataOwner === 'Workplace') {
              if (referencedEstablishment.dataPermissions === null) {
                console.error(`Found subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID}), but access has not been given`);
                // failed to find establishment by UUID - being a subsidairy of this known parent
                return res.status(403).send({message: `Parent not permitted to access Establishment with id: ${req.params.id}`});
              }

              // parent permissions must be either null (no access), "Workplace" or "Workplace and staff" - if not null, then have access to the establishment
              // but only read access (GET)
              if (req.method !== 'GET' && !(req.path.split('/')[1] === 'ownershipChange')) {

                return res.status(403).send({message: `Parent not permitted to update Establishment with id: ${req.params.id}`});
              }
            }

            if(roleCheck && (req.method !== 'GET' && claim.role == 'Read')){
              return res.status(403).send({message: `Not permitted`});
            }

            req.establishmentId = referencedEstablishment.id;
            req.parentIsOwner = referencedEstablishment.dataOwner === 'Parent' ? true : false;
            req.dataPermissions = referencedEstablishment.dataPermissions;    // this will be required for Worker level access tests .../server/routes/establishments/worker.js::validateWorker

            // we now know the
            establishmentIdIsUID = false;

            // restore claims
            req.username = claim.sub;
            req.userUid = claim.userUid;
            req.isParent = claim.isParent;
            req.role = claim.role;
            req.establishment = {
              id: claim.EstblishmentId,
              uid: claim.EstablishmentUID,
              isSubsidiary: false,
              isParent: false
            };

            if(referencedEstablishment.parentId !== null ){
              // Its a sub
              req.establishment.isSubsidiary = true;
            } else if(referencedEstablishment.parentId == null && referencedEstablishment.isParent){
              // It's a parent
              req.establishment.isParent = true;
            }

            return next();

          } catch (err) {
            // failed to find establishment by UUID - being a subsidairy of this known parent
            console.error(`Failed to find subsidiary establishment (${req.params.id}) for this known parent (${claim.EstblishmentId}/${claim.EstablishmentUID})`);
            return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
          }

        } else if (isAuthorised === false) {
          console.error(`hasAuthorisedEstablishment - given and known establishment id do not match: given (${req.params.id})/known (${claim.EstblishmentId}/${claim.EstablishmentUID})`);
          return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
        } else {
          // gets here and all is authorised

          if(roleCheck && (req.method !== 'GET' && claim.role == 'Read')){
            return res.status(403).send({message: `Not permitted`});
          }

          req.username = claim.sub;
          req.userUid = claim.userUid;
          req.isParent = claim.isParent;
          req.role = claim.role;
          req.establishment = {
            id: claim.EstblishmentId,
            uid: claim.EstablishmentUID,
            isSubsidiary: false,
            isParent: false
          };

          let lookupClause = {}
          if (establishmentIdIsUID) {
            lookupClause.uid = req.params.id;
          } else {
            lookupClause.id = req.params.id;
          }

          const foundEstablishment = await models.establishment.findOne({
            attributes: ['id','parentId','dataPermissions', 'dataOwner'],
            where: lookupClause
          });

          if (foundEstablishment && foundEstablishment.id) {
            // having settled all claims, it is necessary to normalise req.establishmentId so it is always the establishment primary key
            req.establishmentId = foundEstablishment.id;
            req.dataPermissions = foundEstablishment.dataPermissions;
            req.parentIsOwner = foundEstablishment.dataOwner === 'Parent' ? true : false;


            if(foundEstablishment.parentId !== null ){
              // Its a sub
              req.establishment.isSubsidiary = true;
            } else if(foundEstablishment.parentId == null && foundEstablishment.isParent){
              // It's a parent
              req.establishment.isParent = true;
            }
          }

          next();
        }
      }
    } else {
      // not authenticated
      res.status(401).send('Requires authorisation');
    }

  } catch (err) {
    if (err.name && err.name === 'TokenExpiredError') {
      return res.status(403).send({
        sucess: false,
        message: 'token expired'
      });
    } else {
      console.error("hasAuthorisedEstablishment: caught err: ", err.name, err);
      return res.status(403).send({
        sucess: false,
        message: 'token is invalid'
      });
    }
  }
}

exports.hasAuthorisedEstablishmentAllowAllRoles = async (req, res, next) => {
  authorisedEstablishmentPermissionCheck(req, res, next, false);
}

exports.hasAuthorisedEstablishment = async (req, res, next) => {
  authorisedEstablishmentPermissionCheck(req, res, next, true);
}


getToken = function (headers) {
  if (headers) {

    let token = headers;

    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
    return token;
  }
  return null;
};

exports.isAuthorisedPasswdReset = (req, res, next) => {
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
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}

exports.isAuthorisedAddUser = (req, res, next) => {
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
}

exports.isAuthorisedInternalAdminApp = (req, res, next) => {
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
}

exports.isAdmin = (req, res , next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        if (claim.role !== 'Admin') {
          return res.status(403).send('You\'re not admin');
        } else {
          req.username = claim.sub;
          req.userUid = claim.userUid;
          next();
        }
      }
    });
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

exports.isAuthorisedRegistrationApproval = (req, res, next) => {
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
}

exports.isAdminOrOnDemandReporting = (req, res , next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  const Token_Secret = config.get('jwt.secret');

  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      const isAdmin = !err ? claim.aud === config.get('jwt.aud.login') && claim.role === 'Admin' ? true : false : false;
      const isOnDemandReport = !err ? claim.aud === 'ADS-WDS-on-demand-reporting' ? true : false : false;

      if (err || !(isAdmin || isOnDemandReport) || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username = claim.sub;
        req.userUid = claim.userUid;
        next();
      }
    });
  } else {
    // not authenticated
    res.status(401).send('isAdminOrOnDemandReporting - Requires authorisation');
  }
};

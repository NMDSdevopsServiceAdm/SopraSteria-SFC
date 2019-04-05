const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';
const thisIss = config.get('jwt.iss');

exports.getTokenSecret = () => {
  return process.env.Token_Secret ? process.env.Token_Secret : "nodeauthsecret";
}

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username= claim.sub;
        req.role = claim.role;
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

// this util middleware will block if the given request is not authorised but will also extract
//  the EstablishmentID token, and make it available on the request
exports.hasAuthorisedEstablishment = (req, res, next) => {
  const token = getToken(req.headers[AUTH_HEADER]);
  
  if (token) {
    jwt.verify(token, Token_Secret, function (err, claim) {
      if (err || claim.aud !== config.get('jwt.aud.login') || claim.iss !== thisIss) {
        return res.status(403).send({
          sucess: false,
          message: 'token is invalid'
        });
      } else {               
  
        // must provide the establishment ID and it must be a number
        if (!claim.EstblishmentId || isNaN(parseInt(claim.EstblishmentId))) {
          console.error('hasAuthorisedEstablishment - missing establishment id parameter');
          return res.status(400).send(`Unknown Establishment ID`);
        }
        const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
        if (!claim.EstablishmentUID || !uuidV4Regex.test(claim.EstablishmentUID)) {
          console.error('hasAuthorisedEstablishment - missing establishment uid parameter');
          return res.status(400).send(`Unknown Establishment UID`);
        }

        // the given parameter could be a UUID or integer
        if (uuidV4Regex.test(req.params.id)) {
          // establishment id in params is a UUID - tests against UID in claim
          if (claim.EstablishmentUID !== req.params.id) {
            console.error(`hasAuthorisedEstablishment - given and known establishment uid do not match: given (${req.params.id})/known (${claim.EstablishmentUID})`);
            return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
          }

          req.establishmentId=   claim.EstablishmentUID;
        } else {
          if (claim.EstblishmentId !== parseInt(req.params.id)) {
            console.error(`hasAuthorisedEstablishment - given and known establishment id do not match: given (${req.params.id})/known (${claim.EstblishmentId})`);
            return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
          }

          req.establishmentId =   claim.EstblishmentId;
        }

        req.username= claim.sub;
        req.role = claim.role;
        next();
      }     
    });
 

  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
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
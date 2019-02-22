const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';
const thisIss = process.env.TOKEN_ISS ? process.env.TOKEN_ISS : "http://localhost:3000";

exports.getTokenSecret = () => {
  return process.env.Token_Secret ? process.env.Token_Secret : "nodeauthsecret";
}

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  const token = getToken(req.headers[AUTH_HEADER]);

  if (token) {
    // var dec = getverify(token, Token_Secret);

    jwt.verify(token, Token_Secret, function (err, claim) {
      console.log("WA DEBUG: token aud: ", claim.aud)
      if (err || claim.aud !== 'ADS-WDS' || claim.iss !== thisIss) {
        return res.status(403).send('Invalid Token');
      } else {
        req.username= claim.sub;
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
      if (err || claim.aud !== 'ADS-WDS' || claim.iss !== thisIss) {
        return res.status(401).send({
          sucess: false,
          message: 'token is invalid'
        });
      } else {               
  
        // must provide the establishment ID and it must be a number
        if (!claim.EstblishmentId || isNaN(parseInt(claim.EstblishmentId))) {
          console.error('isAuthenticated - missing establishment id parameter');
          return res.status(400).send(`Unknown Establishment ID: ${req.params.id}`);
        }
        if (claim.EstblishmentId !== parseInt(req.params.id)) {
          console.error('isAuthenticated - given and known establishment id do not match');
          return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
        }

        req.establishmentId =   claim.EstblishmentId ;        
        req.username= claim.sub;
        req.isAdmin = claim.isAdmin;
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

      if (err || claim.aud !== 'ADS-WDS-password-reset' || claim.iss !== thisIss) {
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
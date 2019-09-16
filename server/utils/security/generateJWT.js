const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const Authorization = require('./isAuthenticated');

// this generates the login JWT
exports.loginJWT = (ttlMinutes, establishmentId, establishmentUid, isParent, username, role, userUid) => {
  const Token_Secret = Authorization.getTokenSecret();

  var claims = {
    EstblishmentId: establishmentId,
    EstablishmentUID: establishmentUid,
    role,
    isParent,
    userUid,
    sub: username,
    aud: config.get('jwt.aud.login'),
    iss: config.get('jwt.iss')
  };

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlMinutes}m`});
};

// this re-generates the login JWT
exports.regenerateLoginToken = (ttlMinutes, req) => {
  const Token_Secret = Authorization.getTokenSecret();

  var claims = {
    EstblishmentId: req.establishment.id,
    EstablishmentUID: req.establishment.uid ? req.establishment.uid : null,
    role: req.role,
    isParent: req.isParent,
    userUid: req.userUid,
    sub: req.username,
    aud: config.get('jwt.aud.login'),
    iss: config.get('jwt.iss')
  };

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlMinutes}m`});
};

// this generates the password reset JWT
exports.passwordResetJWT = (ttlMinutes, username, name, resetUUID) => {
  const Token_Secret = Authorization.getTokenSecret();

  var claims = {
    sub: username,
    aud: config.get('jwt.aud.passwordReset'),
    iss: config.get('jwt.iss'),
    name,
    resetUUID,
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlMinutes}m`});
}

// this generates the add User JWT
exports.addUserJWT = (ttlMinutes, userUID, name, addUserUUID) => {
  const Token_Secret = Authorization.getTokenSecret();

  var claims = {
    sub: userUID,
    aud: config.get('jwt.aud.addUser'),
    iss: config.get('jwt.iss'),
    name,
    addUserUUID,
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlMinutes}m`});
}

const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const Authorization = require('./isAuthenticated');
const Token_Secret = Authorization.getTokenSecret();

// this generates the login JWT
exports.loginJWT = (ttlHours, establishmentId, username, isAdmin) => {
  var claims = {
    EstblishmentId: establishmentId,
    isAdmin: isAdmin ? true : false,
    sub: username,
    aud: config.get('jwt.aud.login'),
    iss: config.get('jwt.iss')
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlHours}h`});   
};

// this generates the password reset JWT
exports.passwordResetJWT = (ttlMinutes, username, name, resetUUID) => {

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

  var claims = {
    sub: userUID,
    aud: config.get('jwt.aud.addUser'),
    iss: config.get('jwt.iss'),
    name,
    addUserUUID,
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlMinutes}m`});
}
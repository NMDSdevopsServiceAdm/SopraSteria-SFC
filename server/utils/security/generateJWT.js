const jwt = require('jsonwebtoken');
const Authorization = require('./isAuthenticated');
const Token_Secret = Authorization.getTokenSecret();

// this generates the login JWT
exports.loginJWT = (ttlHours, establishmentId, username, isAdmin) => {
  console.log("WA DEBUG: is Admin: ", isAdmin)
  var claims = {
    EstblishmentId: establishmentId,
    isAdmin: isAdmin ? true : false,
    sub: username,
    aud: "ADS-WDS",
    iss: process.env.TOKEN_ISS ? process.env.TOKEN_ISS : "http://localhost:3000"
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlHours}h`});   
};

// this generates the password reset JWT
exports.passwordResetJWT = (ttlHours, username, name, resetUUID) => {

  var claims = {
    sub: username,
    aud: 'ADS-WDS-password-reset',
    iss: process.env.TOKEN_ISS ? process.env.TOKEN_ISS : "http://localhost:3000",
    name,
    resetUUID,
  }

  return jwt.sign(JSON.parse(JSON.stringify(claims)), Token_Secret, {expiresIn: `${ttlHours}h`});
}
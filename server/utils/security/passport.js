const Authorization = require('./isAuthenticated');

const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
const User = require('../../models').User;

module.exports = function (passport) {
  const Token_Secret = Authorization.getTokenSecret();
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: Token_Secret,
  };
  passport.use(
    'jwt',
    new JwtStrategy(opts, function (jwt_payload, done) {
      User.findByPk(jwt_payload.id)
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return done(error, false);
        });
    }),
  );
};

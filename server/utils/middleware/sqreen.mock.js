let Sqreen = {};

Sqreen.middleware = (req, res, next) => {
  req.sqreen = {};
  req.sqreen.auth_track = () => {};
  req.sqreen.signup_track = () => {};
  req.sqreen.identify = () => {};
  req.sqreen.track = () => {};
  req.sqreen.userIsBanned = () => {};
  next();
};

module.exports = Sqreen;

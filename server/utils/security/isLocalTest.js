// this util middleware will block if the given request is not issued to localhost or the dev environment
exports.isAuthorised = (req, res, next) => {
  const testOnlyHostRestrictionRegex = /^(localhost|sfcdev\.cloudapps\.digital)/;

  if (req.get('host').match(testOnlyHostRestrictionRegex)) {
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

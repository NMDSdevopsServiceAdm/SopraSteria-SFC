// this util middleware will block if the given request is not issued to localhost
exports.isAuthorised = (req, res, next) => {
  const testOnlyHostRestrictionRegex = /^localhost/;

  if (req.get('host').match(testOnlyHostRestrictionRegex)) {
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

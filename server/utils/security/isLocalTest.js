const isLocal = (req) => {
  const testOnlyHostRestrictionRegex = /^(localhost|sfcdev\.cloudapps\.digital|sfcstaging\.cloudapps\.digital)/;
  return req.get('host').match(testOnlyHostRestrictionRegex);
};

// this util middleware will block if the given request is not issued to localhost or the dev environment
exports.isAuthorised = (req, res, next) => {
  if (isLocal(req)) {
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

exports.isLocal = isLocal;

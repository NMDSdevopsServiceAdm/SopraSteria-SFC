const AUTH_HEADER='authorization';

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  // TODO: temporary implementation based on route/tmpLogin.js

  if (req.headers[AUTH_HEADER] && Number.isInteger(parseInt(req.headers[AUTH_HEADER]))) {
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

// this util middleware will block if the given request is not authorised but will also extract
//  the EstablishmentID token, and make it available on the request
exports.hasAuthorisedEstablishment = (req, res, next) => {
  // TODO: temporary implementation based on route/tmpLogin.js

  if (req.headers[AUTH_HEADER] && Number.isInteger(parseInt(req.headers[AUTH_HEADER]))) {
    req.establishmentId = parseInt(req.headers[AUTH_HEADER]);
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}
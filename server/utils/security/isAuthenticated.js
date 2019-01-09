const AUTH_HEADER='authorization';

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  // TODO: temporary implementation based on route/tmpLogin.js
  if (req.headers[AUTH_HEADER]) {
    console.log(`Have Authorization header (${req.headers[AUTH_HEADER]}) on host request (${req.get('host')})`);
  } else {
    console.log(`No Authorization header on host request (${req.get('host')})`);
  }

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
  if (req.headers[AUTH_HEADER]) {
    console.log(`Have Authorization header (${req.headers[AUTH_HEADER]}) on host request (${req.get('host')})`);
  } else {
    console.log(`No Authorization header on host request (${req.get('host')})`);
  }

  if (req.headers[AUTH_HEADER] && Number.isInteger(parseInt(req.headers[AUTH_HEADER]))) {
    req.establishmentId = parseInt(req.headers[AUTH_HEADER]);

    // must provide the establishment ID and it must be a number
    if (!req.params.id || isNaN(parseInt(req.params.id))) {
      console.error('isAuthenticated - missing establishment id parameter');
      return res.status(400).send(`Unknown Establishment ID: ${req.params.id}`);
    }
    if (req.establishmentId !== parseInt(req.params.id)) {
      console.error('isAuthenticated - given and known establishment id do not match');
      return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
    }
  
    next();
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
}
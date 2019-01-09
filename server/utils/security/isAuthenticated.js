const jwt = require('jsonwebtoken');
const AUTH_HEADER = 'authorization';

exports.getTokenSecret = () => {
  return process.env.Token_Secret ? process.env.Token_Secret : "nodeauthsecret";
}

// this util middleware will block if the given request is not authorised
exports.isAuthorised = (req, res , next) => {
  // TODO: temporary implementation based on route/tmpLogin.js

  if (req.headers[AUTH_HEADER] && Number.isInteger(parseInt(req.headers[AUTH_HEADER]))) {
    let token = req.headers[AUTH_HEADER];
    if (token.startsWith('Bearer')) {
      token = token.slice(7, tokenlength);
    }
    jwt.verify(token, Token_Secret, function (err, data) {
      if (err) {
        return res.json({
          sucess: false,
          message: 'token is invalid'
        });
      } else {
        next();
      }      
    });    
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }
};

// this util middleware will block if the given request is not authorised but will also extract
//  the EstablishmentID token, and make it available on the request
exports.hasAuthorisedEstablishment = (req, res, next) => {
  // TODO: temporary implementation based on route/tmpLogin.js

  if (req.headers[AUTH_HEADER] ) {

    let token = req.headers[AUTH_HEADER];

    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length);
    }
   

    jwt.verify(token, Token_Secret, function (err, data) {
      if (err) {
        return res.json({
          sucess: false,
          message: 'token is invalid'
        });
      } else {        
        

        // must provide the establishment ID and it must be a number
        if (!data.EstblishmentId || isNaN(parseInt(data.EstblishmentId))) {
          console.error('isAuthenticated - missing establishment id parameter');
          return res.status(400).send(`Unknown Establishment ID: ${req.params.id}`);
        }
        if (data.EstblishmentId !== parseInt(req.params.id)) {
          console.error('isAuthenticated - given and known establishment id do not match');
          return res.status(403).send(`Not permitted to access Establishment with id: ${req.params.id}`);
        }
        req.establishmentId =   data.EstblishmentId ;        
        req.Username= data.Username;
        req.isAdmin= data.isAdmin

        next();
        
      }     
    });
    
  } else {
    // not authenticated
    res.status(401).send('Requires authorisation');
  }

}

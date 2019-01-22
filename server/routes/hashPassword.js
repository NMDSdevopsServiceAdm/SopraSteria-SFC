var express = require('express');
var router = express.Router();
const Login = require('../models').login;

router.post('/',async function(req, res) {
  const allLogins = await Login.findAll({
      attributes: ['id', 'password', 'Hash'],
    });

  if (!allLogins) {
    return res.status(500).send('');
  }

  const updatePromises = [];
  let updatedLogins = [];
  allLogins.forEach(thisLogin => {
    // only create a hash if there is not already a hash and there exists a password
    if (!thisLogin.Hash && thisLogin.password && thisLogin.password.length > 0) {
      updatePromises.push(thisLogin.update({
          Hash: thisLogin.hashPassword()
        })
      );
    }
  });

  Promise.all(updatePromises)
  .then((results) => {
    const updatedLogins = [];
    results.forEach(thatPromise => {
      updatedLogins.push({
        id: thatPromise.id
      });
    });
    return res.status(200).send({
      success: updatedLogins
    });
  });

});

module.exports = router;

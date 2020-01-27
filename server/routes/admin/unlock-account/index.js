// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');

const unlockAccount = async (req, res) => {
    // parse input - escaped to prevent SQL injection

  // Sanatize username
  if(req.body.username){
    const username = escape(req.body.username.toLowerCase());

    try {
      // Find the user matching the username
      const login = await models.login.findOne({
        where: {
            username: username
        },
        attributes: ['id', 'username'],
      });
      // Make sure we have the matching user
      if ((login && login.id) && (username === login.username)) {
          try {
            const updateduser = await login.update({
                isActive: true,
                invalidAttempt: 9
            });
            if (updateduser) {
              res.status(200);
              return res.json({status: '0', message: 'User has been set as active'})
            } else {
              return res.status(503).send();
            }
          } catch(error) {
            console.error(error);
            return res.status(503).send();
          }
        } else {
          res.status(400);
          return res.send();
        }
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(400).send();
  }
};

router.route('/').post(async (req, res) => {
  await unlockAccount(req, res);
});

module.exports = router;
module.exports.unlockAccount = unlockAccount;

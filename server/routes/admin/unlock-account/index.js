// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');

router.route('/').post(async (req, res) => {
  await unlockAccount(req, res);
});

const unlockAccount = async (req, res) => {
    // parse input - escaped to prevent SQL injection

  // Sanitize username
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
                invalidAttempt: 9,
                status: null
            });
            if (updateduser) {
              res.status(200);
              return res.json({status: '0', message: 'User has been set as active'})
            } else {
              res.status(503)
              return res.send();
            }
          } catch(error) {
            console.error(error);
            res.status(503)
            return res.send();
          }
        } else {
          res.status(400);
          return res.send();
        }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(400)
    return res.send();
  }
};

module.exports = router;
module.exports.unlockAccount = unlockAccount;

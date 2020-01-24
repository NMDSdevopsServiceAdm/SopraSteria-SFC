// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');

router.route('/').post(async (req, res) => {
  // parse input - escaped to prevent SQL injection

  // Sanatize username
  if(req.body.username){
    const username = escape(req.body.username.toLowerCase());

    try {
      // Find the user matching the username
      const login = await models.login.findOne({
        where: {
            username: {
              [models.Sequelize.Op.iLike] : username
            }
        },
        attributes: ['id', 'username'],
        include: [{
          model: models.user,
          attributes: ['id']
        }]
      });
      // Make sure we have the matching user
      if ((login && login.id) && (username === login.username)) {
        // If approving user
          try {
            const updateduser = await login.update({
                isActive: true,
                invalidAttempt: 9
            });
            if (updateduser) {
              return res.status(200).json({status: '0', message: 'User has been set as active'})
            } else {
              return res.status(503).send();
            }
          } catch(error) {
            console.error(error);
            return res.status(503).send();
          }
        } else {
          return res.status(400).send();
        }
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(400).send();
  }
});

module.exports = router;

// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');

router.route('/').post(async (req, res) => {
  // parse input - escaped to prevent SQL injection
  if (!req.body.username) {
    return res.status(400).send();
  }
  // Sanatize username
  const username = escape(req.body.username.toLowerCase());

  try {
    // Find the user matching the username
    const user = await models.login.findOne({
      where: {
          username: {
            [models.Sequelize.Op.iLike] : username
          }
      }
    });
    // Make sure we have the matching user
    if ((user && user.id) && (username === user.username)) {
      // If approving user
      if (req.body.approve) {
        // TODO: Email saying they've been accepted
        // Update their active status to true
        await user.update({
            isActive: true,
            status: null
        });
        return res.status(200).json({status: '0', message: 'User has been set as active'})
      } else {
        // TODO: Email saying they've been rejected
        // Remove the user
        return res.status(200).json({status: '0', message: 'User has been removed'})
      }
    } else {
      return res.status(400).send();
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

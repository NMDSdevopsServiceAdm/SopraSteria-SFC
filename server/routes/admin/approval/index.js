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
          attributes: ['id'],
          include: [{
            model: models.establishment,
            attributes: ['id']
          }]
        }]
      });
      // Make sure we have the matching user
      if ((login && login.id) && (username === login.username)) {
        const establishment = await models.establishment.findOne({
          where: {
              id: login.user.establishment.id
          },
          attributes: ['id']
        });
        const user = await models.user.findOne({
          where: {
              id: login.user.id
          },
          attributes: ['id']
        });
        // If approving user
        if (req.body.approve && establishment) {
          // TODO: Email saying they've been accepted
          // Update their active status to true
          try {
            const updateduser = await login.update({
                isActive: true,
                status: null
            });
            const updatedestablishment = await establishment.update({
              ustatus: null
            });
            if (updateduser && updatedestablishment) {
              return res.status(200).json({status: '0', message: 'User has been set as active'})
            } else {
              return res.status(503).send();
            }
          } catch(error) {
            console.error(error);
            return res.status(503).send();
          }
        } else {
          // TODO: Email saying they've been rejected
          // Remove the user
          try{
            const deleteduser = await user.destroy();
            const deletedestablishment = await establishment.destroy();
            if (deleteduser && deletedestablishment) {
              return res.status(200).json({status: '0', message: 'User has been removed'});
            }
          } catch(error) {
            console.error(error);
            return res.status(503).send();
          }
        }
      } else {
        return res.status(400).send();
      }
    } catch (error) {
      console.log(error);
    }
  }else{
    const establishment = await models.establishment.findOne({
      where: {
          id: req.body.establishmentId
      },
      attributes: ['id']
    });
    if (req.body.approve && req.body.establishmentId) {
      // Establishment:: Update their ustatus to null
      try {
        const updatedestablishment = await establishment.update({
          ustatus: null
        });
        if (updatedestablishment) {
          return res.status(200).json({status: '0', message: 'Workplace has been set as active'})
        } else {
          return res.status(503).send();
        }
      } catch(error) {
        console.error(error);
        return res.status(503).send();
      }
    } else {
      // Remove the establishment
      try{
        const deletedestablishment = await establishment.destroy();
        if (deletedestablishment) {
          return res.status(200).json({status: '0', message: 'Workplace has been removed'});
        }
      } catch(error) {
        console.error(error);
        return res.status(503).send();
      }
    }
  }
});

module.exports = router;

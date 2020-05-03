// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');
const util = require('util');

const userApprovalConfirmation = 'User has been set as active';
const userRejectionConfirmation = 'User has been removed';
const workplaceApprovalConfirmation = 'Workplace has been set as active';
const workplaceRejectionConfirmation = 'Workplace has been removed';

router.route('/').post(async (req, res) => {
  await adminApproval(req, res);
});

const adminApproval = async (req, res) => {
  // parse input - escaped to prevent SQL injection
  // Sanitize username
  if (req.body.username) {
    const username = escape(req.body.username.toLowerCase());

    try {
      // Find the user matching the username
      const login = await models.login.findOne({
        where: {
          username: {
            [models.Sequelize.Op.iLike]: username
          }
        },
        attributes: ['id', 'username'],
        include: [
          {
            model: models.user,
            attributes: ['id'],
            include: [
              {
                model: models.establishment,
                attributes: ['id']
              }
            ]
          }
        ]
      });
      // Make sure we have the matching user
      if ((login && login.id) && (username === login.username)) {
        // TODO: Rename establishment to workplace.
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
            const updatedLogin = await login.update({
              isActive: true,
              status: null
            });
            const updatedestablishment = await establishment.update({
              ustatus: null
            });
            if (updatedLogin && updatedestablishment) {
              // TODO: use const string!
              return res.status(200).json({ status: '0', message: 'User has been set as active' })
            } else {
              return res.status(503).send();
            }
          } catch (error) {
            console.error(error);
            return res.status(503).send();
          }
        } else {
          // TODO: Email saying they've been rejected
          // Remove the user
          try {
            if (user && establishment) {
              const deleteduser = await user.destroy();
              const deletedestablishment = await establishment.destroy();
              if (deleteduser && deletedestablishment) {
                // TODO: use const string!
                return res.status(200).json({ status: '0', message: 'User has been removed' });
              } else {
                return res.status(503).send();
              }
            } else {
              return res.status(503).send();
            }
          } catch (error) {
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
  } else {
    const nmdsId = req.body.nmdsId;
    const checkEstablishmentIsUnique = await models.establishment.findOne({
      where: {
        id: {
          [Sequelize.Op.ne]: req.body.establishmentId
        },
        nmdsId: nmdsId,
      },
      attributes: ['id']
    });

    if (checkEstablishmentIsUnique !== null) {
      return res.status(400).json({
        nmdsId: `This workplace ID (${nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
      });
    }

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
          nmdsId: nmdsId,
          ustatus: null
        });
        if (updatedestablishment) {
          // TODO: use const string!
          return res.status(200).json({ status: '0', message: 'Workplace has been set as active' })
        } else {
          return res.status(503).send();
        }
      } catch (error) {
        console.error(error);
        return res.status(503).send();
      }
    } else {
      // Remove the establishment
      try {
        const deletedestablishment = await establishment.destroy();
        if (deletedestablishment) {
          // TODO: use const string!
          return res.status(200).json({ status: '0', message: 'Workplace has been removed' });
        }
      } catch (error) {
        console.error(error);
        return res.status(503).send();
      }
    }
  }
};

module.exports = router;
module.exports.adminApproval = adminApproval;

module.exports.userApprovalConfirmation = userApprovalConfirmation;
module.exports.userRejectionConfirmation = userRejectionConfirmation;
module.exports.workplaceApprovalConfirmation = workplaceApprovalConfirmation;
module.exports.workplaceRejectionConfirmation = workplaceRejectionConfirmation;

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
  if (req.body.username) {
    await _approveNewUser(req, res);
  } else {
    await _approveNewWorkplace(req, res);
  }
};

const _approveNewUser = async (req, res) => {
  var workplaceIsUnique = await _workplaceIsUnique(req.body.establishmentId, req.body.nmdsId);
  if (!workplaceIsUnique) {
    return res.status(400).json({
      nmdsId: `This workplace ID (${req.body.nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
    });
  }

  const username = _parseEscapedInputAndSanitizeUsername(req.body.username);

  try {
    const login = await _findLoginMatchingUsername(username);

    // Make sure we have the matching user
    if ((login && login.id) && (username === login.username)) {
      const workplace = await _findWorkplace(login.user.establishment.id);
      const user = await _findUser(login.user.id);

      // If approving user
      if (req.body.approve && workplace) {
        // TODO: Email saying they've been accepted
        // Update their active status to true
        try {
          const updatedLogin = await login.update({
            isActive: true,
            status: null
          });
          const updatedworkplace = await workplace.update({
            nmdsId: req.body.nmdsId,
            ustatus: null
          });
          if (updatedLogin && updatedworkplace) {
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
          if (user && workplace) {
            const deleteduser = await user.destroy();
            const deletedworkplace = await workplace.destroy();
            if (deleteduser && deletedworkplace) {
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
};

const _approveNewWorkplace = async (req, res) => {
  const nmdsId = req.body.nmdsId;

  var workplaceIsUnique = await _workplaceIsUnique(req.body.establishmentId, req.body.nmdsId);
  if (!workplaceIsUnique) {
    return res.status(400).json({
      nmdsId: `This workplace ID (${nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
    });
  }

  const workplace = await models.establishment.findOne({
    where: {
      id: req.body.establishmentId
    },
    attributes: ['id']
  });

  if (req.body.approve && req.body.establishmentId) {
    // workplace:: Update their ustatus to null
    try {
      const updatedworkplace = await workplace.update({
        nmdsId: nmdsId,
        ustatus: null
      });
      if (updatedworkplace) {
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
    // Remove the workplace
    try {
      const deletedworkplace = await workplace.destroy();
      if (deletedworkplace) {
        // TODO: use const string!
        return res.status(200).json({ status: '0', message: 'Workplace has been removed' });
      } else {
        return res.status(503).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(503).send();
    }
  }
};

const _workplaceIsUnique = async (establishmentId, nmdsId) => {
  const workplaceWithDuplicateId = await models.establishment.findOne({
    where: {
      id: {
        [Sequelize.Op.ne]: establishmentId
      },
      nmdsId: nmdsId,
    },
    attributes: ['id']
  });
  return (workplaceWithDuplicateId === null);
};

const _parseEscapedInputAndSanitizeUsername = (username) => {
  return escape(username.toLowerCase());
};

const _findLoginMatchingUsername = async (username) => {
  return await models.login.findOne({
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
};

const _findWorkplace = async (establishmentId) => {
  return await models.establishment.findOne({
    where: {
      id: establishmentId
    },
    attributes: ['id']
  });
};

const _findUser = async (loginId) => {
  return await models.user.findOne({
    where: {
      id: loginId
    },
    attributes: ['id']
  });
};

module.exports = router;
module.exports.adminApproval = adminApproval;

module.exports.userApprovalConfirmation = userApprovalConfirmation;
module.exports.userRejectionConfirmation = userRejectionConfirmation;
module.exports.workplaceApprovalConfirmation = workplaceApprovalConfirmation;
module.exports.workplaceRejectionConfirmation = workplaceRejectionConfirmation;

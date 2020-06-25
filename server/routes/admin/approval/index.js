// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');
const userApprovalConfirmation = 'User has been set as active';
const userRejectionConfirmation = 'User has been removed';
const workplaceApprovalConfirmation = 'Workplace has been set as active';
const workplaceRejectionConfirmation = 'Workplace has been removed';

router.route('/').post(async (req, res) => {
  await adminApproval(req, res);
});

const adminApproval = async (req, res) => {
  if (req.body.username) {
    await _approveOrRejectNewUser(req, res);
  } else {
    await _approveOrRejectNewWorkplace(req, res);
  }
};

const _approveOrRejectNewUser = async (req, res) => {
  const username = _parseEscapedInputAndSanitizeUsername(req.body.username);

  try {
    const login = await _findLoginMatchingUsername(username);

    // Make sure we have the matching user
    if ((login && login.id) && (username === login.username)) {
      const workplace = await _findWorkplace(login.user.establishment.id);
      const user = await _findUser(login.user.id);

      var workplaceIsUnique = await _workplaceIsUnique(login.user.establishment.id, req.body.nmdsId);
      if (!workplaceIsUnique) {
        return res.status(400).json({
          nmdsId: `This workplace ID (${req.body.nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
        });
      }

      if (req.body.approve && workplace) {
        await _approveNewUser(login, workplace, req.body.nmdsId, res);
      } else {
        await _rejectNewUser(user, workplace, res);
      }
    } else {
      return res.status(400).send();
    }
  } catch (error) {
    console.log(error);
  }
};

const _approveOrRejectNewWorkplace = async (req, res) => {
  const nmdsId = req.body.nmdsId;

  var workplaceIsUnique = await _workplaceIsUnique(req.body.establishmentId, req.body.nmdsId);
  if (!workplaceIsUnique) {
    return res.status(400).json({
      nmdsId: `This workplace ID (${nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
    });
  }

  const workplace = await _findWorkplace(req.body.establishmentId);

  if (req.body.approve && req.body.establishmentId) {
    await _approveNewWorkplace(workplace, nmdsId, res);
  } else {
    await _rejectNewWorkplace(workplace, res);
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

const _approveNewUser = async (login, workplace, nmdsId, res) => {
  // TODO: Email saying they've been accepted
  // Update their active status to true
  try {
    const updatedLogin = await login.update({
      isActive: true,
      status: null
    });
    const updatedworkplace = await workplace.update({
      nmdsId: nmdsId,
      ustatus: null
    });
    if (updatedLogin && updatedworkplace) {
      return res.status(200).json({ status: '0', message: userApprovalConfirmation })
    } else {
      return res.status(503).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

const _rejectNewUser = async (user, workplace, res) => {
  // TODO: Email saying they've been rejected
  // Remove the user
  try {
    if (user && workplace) {
      const deleteduser = await user.destroy();
      const deletedworkplace = await workplace.destroy();
      if (deleteduser && deletedworkplace) {
        return res.status(200).json({ status: '0', message: userRejectionConfirmation });
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
};

const _approveNewWorkplace = async (workplace, nmdsId, res) => {
  try {
    const updatedworkplace = await workplace.update({
      nmdsId: nmdsId,
      ustatus: null
    });
    if (updatedworkplace) {
      return res.status(200).json({ status: '0', message: workplaceApprovalConfirmation })
    } else {
      return res.status(503).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

const _rejectNewWorkplace = async (workplace, res) => {
  try {
    const deletedworkplace = await workplace.destroy();
    if (deletedworkplace) {
      return res.status(200).json({ status: '0', message: workplaceRejectionConfirmation });
    } else {
      return res.status(503).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(503).send();
  }
};

module.exports = router;
module.exports.adminApproval = adminApproval;

module.exports.userApprovalConfirmation = userApprovalConfirmation;
module.exports.userRejectionConfirmation = userRejectionConfirmation;
module.exports.workplaceApprovalConfirmation = workplaceApprovalConfirmation;
module.exports.workplaceRejectionConfirmation = workplaceRejectionConfirmation;

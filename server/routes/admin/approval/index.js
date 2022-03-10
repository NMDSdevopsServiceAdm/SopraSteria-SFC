// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const userApprovalConfirmation = 'User has been set as active';
const userRejectionConfirmation = 'User has been rejected';
const workplaceApprovalConfirmation = 'Workplace has been set as active';
const workplaceRejectionConfirmation = 'Workplace has been rejected';

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
  try {
    const username = _parseEscapedInputAndSanitizeUsername(req.body.username);

    const login = await models.login.findByUsername(username);

    if (login && login.id && username === login.username) {
      const workplace = await models.establishment.findbyId(login.user.establishmentId);
      const user = await models.user.findByLoginId(login.user.id);

      const workplaceIsUnique = await _workplaceIsUnique(workplace.uid, req.body.nmdsId);

      if (!workplaceIsUnique) {
        return res.status(400).json({
          nmdsId: `This workplace ID (${req.body.nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
        });
      }

      if (req.body.approve && workplace) {
        await _approveNewUser(login, workplace, req.body.nmdsId, res);
      } else {
        await _rejectNewUser(user, workplace, req, res);
      }
    } else {
      return res.status(400).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _approveOrRejectNewWorkplace = async (req, res) => {
  try {
    const nmdsId = req.body.nmdsId;

    const workplace = await models.establishment.findbyId(req.body.establishmentId);

    const workplaceIsUnique = await _workplaceIsUnique(workplace.uid, req.body.nmdsId);

    if (!workplaceIsUnique) {
      return res.status(400).json({
        nmdsId: `This workplace ID (${nmdsId}) belongs to another workplace. Enter a different workplace ID.`,
      });
    }

    if (req.body.approve && req.body.establishmentId) {
      await _approveNewWorkplace(workplace, nmdsId, res);
    } else {
      await _rejectNewWorkplace(workplace, req, res);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _approveNewUser = async (login, workplace, nmdsId, res) => {
  try {
    const updatedLogin = await login.update({
      isActive: true,
      status: null,
    });
    const updatedWorkplace = await workplace.update({
      nmdsId: nmdsId,
      ustatus: null,
      inReview: false,
      reviewer: null,
    });
    if (updatedLogin && updatedWorkplace) {
      return res.status(200).json({ status: '0', message: userApprovalConfirmation });
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _rejectNewUser = async (user, workplace, req, res) => {
  try {
    if (user && workplace) {
      const deletedUser = await user.destroy();

      const adminUser = await models.user.findByUUID(req.userUid);

      const rejectedWorkplace = await workplace.update({
        ustatus: 'REJECTED',
        inReview: false,
        reviewer: null,
        updated: new Date(),
        updatedBy: adminUser.FullNameValue,
        archived: true,
      });

      if (deletedUser && rejectedWorkplace) {
        return res.status(200).json({ status: '0', message: userRejectionConfirmation });
      } else {
        return res.status(500).send();
      }
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _approveNewWorkplace = async (workplace, nmdsId, res) => {
  try {
    const updatedWorkplace = await workplace.update({
      nmdsId: nmdsId,
      ustatus: null,
      inReview: false,
      reviewer: null,
    });
    if (updatedWorkplace) {
      return res.status(200).json({ status: '0', message: workplaceApprovalConfirmation });
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _rejectNewWorkplace = async (workplace, req, res) => {
  try {
    const adminUser = await models.user.findByUUID(req.userUid);

    const rejectedWorkplace = await workplace.update({
      ustatus: 'REJECTED',
      inReview: false,
      reviewer: null,
      updated: new Date(),
      updatedBy: adminUser.FullNameValue,
      archived: true,
    });

    if (rejectedWorkplace) {
      return res.status(200).json({ status: '0', message: workplaceRejectionConfirmation });
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const _workplaceIsUnique = async (establishmentUid, nmdsId) => {
  const workplaceWithDuplicateId = await models.establishment.findEstablishmentWithSameNmdsId(establishmentUid, nmdsId);

  return workplaceWithDuplicateId === null;
};

const _parseEscapedInputAndSanitizeUsername = (username) => {
  return escape(username.toLowerCase());
};

module.exports = router;
module.exports.adminApproval = adminApproval;

module.exports.userApprovalConfirmation = userApprovalConfirmation;
module.exports.userRejectionConfirmation = userRejectionConfirmation;
module.exports.workplaceApprovalConfirmation = workplaceApprovalConfirmation;
module.exports.workplaceRejectionConfirmation = workplaceRejectionConfirmation;

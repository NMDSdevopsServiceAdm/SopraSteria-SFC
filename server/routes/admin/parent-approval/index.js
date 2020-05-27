const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const config = require('../../../config/config');
const notifications = require('../../../data/notifications')

const uuid = require('uuid')

const parentApprovalConfirmation = 'Parent request approved';
const parentRejectionConfirmation = 'Parent request rejected';

const getParentRequests = async (req, res) => {
  try {
    let approvalResults = await models.Approvals.findAllPending('BecomeAParent');
    let parentRequests = approvalResults.map(approval => {
        return {
          requestId: approval.ID,
          requestUUID: approval.UUID,
          establishmentId: approval.EstablishmentID,
          establishmentUid: approval.Establishment.uid,
          userId: approval.UserID,
          workplaceId: approval.Establishment.nmdsId,
          userName: approval.User.FullNameValue,
          orgName: approval.Establishment.NameValue,
          requested: moment.utc(approval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma')
        };
      }
    );
    return res.status(200).json(parentRequests);
  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
};

const parentApproval = async (req, res) => {
  try {
    if (req.body.approve) {
      await _approveParent(req, res);
    } else {
      await _rejectParent(req, res);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
};

const _approveParent = async (req, res) => {
  await _notify(req.body.parentRequestId, req.userUid, req.body.establishmentId);
  await _updateApprovalStatus(req.body.parentRequestId, 'Approved');
  await _makeWorkplaceIntoParent(req.body.establishmentId);

  return res.status(200).json({ status: '0', message: parentApprovalConfirmation });
};

const _rejectParent = async (req, res) => {
  await _notify(req.body.parentRequestId, req.userUid, req.body.establishmentId);
  await _updateApprovalStatus(req.body.parentRequestId, 'Rejected');

  return res.status(200).json({ status: '0', message: parentRejectionConfirmation });
};

const _updateApprovalStatus = async (approvalId, status) => {
  let singleApproval = await models.Approvals.findbyId(approvalId);
  if (singleApproval) {
    singleApproval.Status = status;
    await singleApproval.save();
  } else {
    throw `Can't find approval item with id ${approvalId}`;
  }
};

const _makeWorkplaceIntoParent = async (id) => {
  let workplace = await models.establishment.findbyId(id);
  if(workplace) {
    workplace.isParent = true;
    await workplace.save();
  } else {
    throw `Can't find workplace with id ${id}`;
  }
};

const _notify = async (approvalId, userUid, establishmentId) => {
  const approval = await models.Approvals.findbyId(approvalId);
  const typUid = approval.UUID;
  const params = {
    notificationUid: uuid.v4(),
    type: 'BECOMEAPARENT',
    typeUid: typUid,
    userUid: userUid
  };
  const users = await notifications.getAllUser({establishmentId: establishmentId});
  await Promise.all(users.map(async (user) => {
    const userparams = {
      ...params,
      recipientUserUid: user.UserUID
    };
    await notifications.insertNewNotification(userparams);
  }));
};

router.route('/').post(parentApproval);
router.route('/').get(getParentRequests);

module.exports = router;
module.exports.parentApproval = parentApproval;
module.exports.getParentRequests = getParentRequests;

module.exports.parentApprovalConfirmation = parentApprovalConfirmation;
module.exports.parentRejectionConfirmation = parentRejectionConfirmation;

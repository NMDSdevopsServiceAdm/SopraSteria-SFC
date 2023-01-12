const express = require('express');
const router = express.Router();
const models = require('../../../models');
const notifications = require('../../../data/notifications');
const { convertIndividualParentRequest } = require('../../../utils/parentIndividualRequestUtils');
const uuid = require('uuid');

const parentApprovalConfirmation = 'Parent request approved';
const parentRejectionConfirmation = 'Parent request rejected';

const getParentRequests = async (req, res) => {
  try {
    let approvalResults = await models.Approvals.findAllPendingAndInProgress('BecomeAParent');
    let parentRequests = await _mapResults(approvalResults);
    return res.status(200).json(parentRequests);
  } catch (error) {
    console.error(error);
    return res.status(400).send();
  }
};

const getIndividualParentRequest = async (req, res) => {
  try {
    const { establishmentUid } = req.params;
    const establishment = await models.establishment.findByUid(establishmentUid);

    if (!establishment) {
      return res.status(400).json({
        message: 'Establishment could not be found',
      });
    }

    const individualParentRequest = await models.Approvals.findbyEstablishmentId(establishment.id, 'BecomeAParent');

    const convertedIndividualParentRequest = convertIndividualParentRequest(individualParentRequest);
    res.status(200).send(convertedIndividualParentRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'There was an error retrieving the parent request' });
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
    console.error(error);
    return res.status(400).send();
  }
};

const _mapResults = async (approvalResults) => {
  return approvalResults.map((approval) => {
    return {
      requestId: approval.ID,
      requestUUID: approval.UUID,
      establishmentId: approval.EstablishmentID,
      establishmentUid: approval.Establishment.uid,
      userId: approval.UserID,
      workplaceId: approval.Establishment.nmdsId,
      userName: approval.User.FullNameValue,
      orgName: approval.Establishment.NameValue,
      requested: approval.createdAt,
      status: approval.Status,
    };
  });
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
  if (workplace) {
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
    type: 'BECOMEAPARENT',
    typeUid: typUid,
    userUid: userUid,
  };
  const users = await notifications.getAllUser({ establishmentId: establishmentId });
  await Promise.all(
    users.map(async (user) => {
      const userparams = {
        ...params,
        targetUid: user.UserUID,
        notificationUid: uuid.v4(),
      };
      await notifications.insertNewUserNotification(userparams);
    }),
  );
};

router.route('/').post(parentApproval);
router.route('/').get(getParentRequests);
router.route('/:establishmentUid').get(getIndividualParentRequest);
router.use('/updateStatus', require('./updateStatus.js'));

module.exports = router;
module.exports.parentApproval = parentApproval;
module.exports.getParentRequests = getParentRequests;

module.exports.getIndividualParentRequest = getIndividualParentRequest;
module.exports.parentApprovalConfirmation = parentApprovalConfirmation;
module.exports.parentRejectionConfirmation = parentRejectionConfirmation;

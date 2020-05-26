// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const config = require('../../../config/config');

const parentApprovalConfirmation = 'You have approved the request for X to become a parent workplace';
const parentRejectionConfirmation = 'You have rejected the request for X to become a parent workplace';

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
  await _notifyApproval(req, res);
  await _updateApprovalStatus(req.body.parentRequestId, 'Approved');
  await _makeWorkplaceIntoParent(req.body.establishmentId);

  return res.status(200).json({ status: '0', message: parentApprovalConfirmation });
};

const _rejectParent = async (req, res) => {
  await _notifyRejection(req, res);
  await _updateApprovalStatus(req.body.parentRequestId, 'Rejected');

  return res.status(200).json({ status: '0', message: parentRejectionConfirmation });
};

const _updateApprovalStatus = async (approvalId, status) => {
  let singleApproval = await models.Approvals.findbyId(approvalId);
  singleApproval.Status = status;
  await singleApproval.save();
};

const _makeWorkplaceIntoParent = async (id) => {
  let workplace = await models.establishment.findbyId(id);
  workplace.isParent = true;
  await workplace.save();
};

const _notifyApproval = async (req, res) => {
  return true;
};

const _notifyRejection = async (req, res) => {
  return true;
};

router.route('/').post(parentApproval);
router.route('/').get(getParentRequests);

module.exports = router;
module.exports.parentApproval = parentApproval;
module.exports.getParentRequests = getParentRequests;

module.exports.parentApprovalConfirmation = parentApprovalConfirmation;
module.exports.parentRejectionConfirmation = parentRejectionConfirmation;

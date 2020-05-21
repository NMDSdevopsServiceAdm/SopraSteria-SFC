// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');

const parentApprovalConfirmation = 'You have approved the request for X to become a parent workplace';
const parentRejectionConfirmation = 'You have rejected the request for X to become a parent workplace';

const getParentRequests = async (req, res) => {
  return res.status(200).json(
      [ {
          establishmentId: 1111,
          workplaceId: 'I1234567',
          userName: 'Magnificent Maisie',
          orgName: 'Marvellous Mansions',
          requested: '2019-08-27 16:04:35.914'
        },{
          establishmentId: 3333,
          workplaceId: 'B9999999',
          userName: 'Everso Stupid',
          orgName: 'Everly Towers',
          requested: '2020-05-20 16:04:35.914'
      }]);
};

const parentApproval = async (req, res) => {
  if (req.body.approve) {
    await _approveParent(req, res);
  } else {
    await _rejectParent(req, res);
  }
};

const _approveParent = async (req, res) => {
  await _notifyApproval(req, res);
  return res.status(200).json({ status: '0', message: parentApprovalConfirmation });
};

const _rejectParent = async (req, res) => {
  await _notifyRejection(req, res);
  return res.status(200).json({ status: '0', message: parentRejectionConfirmation });
};

const _notifyApproval = async (req, res) => {
  return res.status(200).json({ status: '0', message: parentApprovalConfirmation });
};

const _notifyRejection = async (req, res) => {
  return res.status(200).json({ status: '0', message: parentRejectionConfirmation });
};

router.route('/').post(parentApproval);
router.route('/').get(getParentRequests);

module.exports = router;
module.exports.parentApproval = parentApproval;
module.exports.getParentRequests = getParentRequests;

module.exports.parentApprovalConfirmation = parentApprovalConfirmation;
module.exports.parentRejectionConfirmation = parentRejectionConfirmation;

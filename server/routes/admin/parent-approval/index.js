// default route for admin/approval
const express = require('express');
const router = express.Router();
const models = require('../../../models');
const Sequelize = require('sequelize');

const parentApprovalConfirmation = 'You have approved the request for X to become a parent workplace';
const parentRejectionConfirmation = 'You have rejected the request for X to become a parent workplace';

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

module.exports = router;
module.exports.parentApproval = parentApproval;

module.exports.parentApprovalConfirmation = parentApprovalConfirmation;
module.exports.parentRejectionConfirmation = parentRejectionConfirmation;

const express = require('express');
const router = express.Router();
const models = require('../../../models');
const moment = require('moment-timezone');
const config = require('../../../config/config');
const mainServiceRouter = require('../../establishments/mainService');
const Establishment = require('../../../models/classes/establishment');

const cqcStatusChangeApprovalConfirmation = 'CQC status change approved';
const cqcStatusChangeRejectionConfirmation = 'CQC status change rejected';

const getCqcStatusChanges = async (req, res) => {
  try {
    let approvalResults = await models.Approvals.findAllPending('CqcStatusChange');
    let cqcStatusChanges = await _mapResults(approvalResults);
    return res.status(200).json(cqcStatusChanges);
  } catch (error) {
    console.error(error);
    return res.status(400).send();
  }
};

const cqcStatusChanges = async (req, res) => {
  try {
    if (req.body.approve) {
      await _approveChange(req, res);
    } else {
      await _rejectChange(req, res);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send();
  }
};

const _mapResults = async (approvalResults) => {
  const promises = approvalResults.map(async (approval) => {
    data = approval.Data;
    const currentServiceID = data.currentService.id || null;
    const requestedServiceID = data.requestedService.id || null;
    if (!currentServiceID || !requestedServiceID) throw `Can't find request data with ID ${approval.id}`;
    return {
      requestId: approval.ID,
      requestUUID: approval.UUID,
      establishmentId: approval.EstablishmentID,
      establishmentUid: approval.Establishment.uid,
      userId: approval.UserID,
      workplaceId: approval.Establishment.nmdsId,
      username: approval.User.FullNameValue,
      orgName: approval.Establishment.NameValue,
      requested: moment.utc(approval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
      data: {
        currentService: {
          ID: currentServiceID,
          name: data.currentService.name,
          other: data.currentService.other || null,
        },
        requestedService: {
          ID: requestedServiceID,
          name: data.requestedService.name,
          other: data.requestedService.other || null,
        },
      },
    };
  });
  return await Promise.all(promises);
};

const _approveChange = async (req, res) => {
  await _updateApprovalStatus(req.body.approvalId, 'Approved');
  const results = await _updateMainService(req, res);
  if (results.success) {
    return res.status(200).json({ status: '0', message: cqcStatusChangeApprovalConfirmation });
  } else {
    return res.status(results.errorCode).json({ status: errorCode, message: errorMsg });
  }
};

const _rejectChange = async (req, res) => {
  await _updateApprovalStatus(req.body.approvalId, 'Rejected');

  return res.status(200).json({ status: '0', message: cqcStatusChangeRejectionConfirmation });
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

const _updateMainService = async (req, res) => {
  const approvalId = req.body.approvalId;
  const username = req.username;

  const singleApproval = await models.Approvals.findbyId(approvalId);
  if (singleApproval) {
    const data = singleApproval.Data;
    const establishmentId = singleApproval.EstablishmentID;

    const mainService = {
      id: data.requestedService.id,
      name: data.requestedService.name,
      ...(data.requestedService.other && { other: data.requestedService.other }),
    };

    const thisEstablishment = new Establishment.Establishment(username);
    await thisEstablishment.restore(establishmentId);

    const addIsRegulated = true;

    return await mainServiceRouter.changeMainService(res, thisEstablishment, addIsRegulated, mainService, username);
  } else {
    throw `Can't find Approval with id ${approvalId}`;
  }
};

router.route('/').post(cqcStatusChanges);
router.route('/').get(getCqcStatusChanges);

module.exports = router;
module.exports.cqcStatusChanges = cqcStatusChanges;
module.exports.getCqcStatusChanges = getCqcStatusChanges;
module.exports.cqcStatusChangeApprovalConfirmation = cqcStatusChangeApprovalConfirmation;
module.exports.cqcStatusChangeRejectionConfirmation = cqcStatusChangeRejectionConfirmation;

const express = require('express');
const router = express.Router();
const models = require('../../../models');
const moment = require('moment-timezone');
const config = require('../../../config/config');
// const notifications = require('../../../data/notifications');
const uuid = require('uuid');
const mainServiceRouter = require('../../establishments/mainService');

const cqcStatusChangeApprovalConfirmation = 'CQC status change approved';
const cqcStatusChangeRejectionConfirmation = 'CQC status change rejected';

const getCqcStatusChanges = async (req, res) => {
  console.log('CALEED getCQCSTATUS');
  try {
    let approvalResults = await models.Approvals.findAllPending('CqcStatusChange');
    let cqcStatusChanges = await _mapResults(approvalResults);
    return res.status(200).json(cqcStatusChanges);
  } catch (error) {
    console.log(error);
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
    console.log(error);
    return res.status(400).send();
  }
};

const _mapResults = async (approvalResults) => {
  const promises = approvalResults.map(async approval => {
    data = approval.Data;
    const currentServiceID = data.currentService.id || null;
    const requestedServiceID = data.requestedService.id || null;
    if (!currentServiceID || !requestedServiceID) throw `Can't find request data with ID ${approval.id}`;
    const currentServiceName = await models.services.findNameByID(currentServiceID);
    const requestedServiceName = await models.services.findNameByID(requestedServiceID);
    return {
      requestId: approval.ID,
      requestUUID: approval.UUID,
      establishmentId: approval.EstablishmentID,
      establishmentUid: approval.Establishment.uid,
      userId: approval.UserID,
      workplaceId: approval.Establishment.nmdsId,
      userName: approval.User.FullNameValue,
      orgName: approval.Establishment.NameValue,
      requested: moment.utc(approval.createdAt).tz(config.get('timezone')).format('D/M/YYYY h:mma'),
      currentService: {
        ID: currentServiceID,
        name: currentServiceName.name
      },
      requestedService: {
        ID: requestedServiceID,
        name: requestedServiceName.name
      }
    };
  });
  return await Promise.all(promises);
};

const _approveChange = async (req, res) => {
  console.log('_approveChange');
  console.log(req.body.approvalId);
  // await _notify(req.body.cqcStatusChangeId, req.userUid, req.body.establishmentId);
  //await _updateApprovalStatus(req.body.approvalId, 'Approved');
  const results = await _updateMainService(req.body.approvalId, req.username);
  console.log('results:');
  console.log(results);
  if (results.success) {
    return res.status(200).json({ status: '0', message: cqcStatusChangeApprovalConfirmation });
  } else {
    return res.status(results.errorCode).json({ status: errorCode, message: errorMsg });
  }
};

const _rejectChange = async (req, res) => {
  // await _notify(req.body.cqcStatusChangeId, req.userUid, req.body.establishmentId);
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

// interface MainServiceRequest {
//   mainService: {
//     id: number;
//     name: string;
//     other?: string;
//   };
// }

const _updateMainService = async (approvalId, username) => {
  const singleApproval = await models.Approvals.findbyId(approvalId);
  data = singleApproval.Data;
  const establishmentId = singleApproval.EstablishmentID;
  const requestedServiceId = data.requestedService.id;
  const requestServiceName = await models.services.findNameByID(requestedServiceId).name;
  if (singleApproval) {
    const mainService = {
      id: data.requestedService.id,
      name: requestServiceName,
      ...(data.requestedService.other && { other: data.requestedService.other })
    };
    const addIsRegulated = true;
    return await mainServiceRouter.updateMainService(establishmentId, username, mainService, addIsRegulated);

  } else {
    throw `Can't find Approval with id ${approvalId}`;
  }
};

//
// const _notify = async (approvalId, userUid, establishmentId) => {
//   const approval = await models.Approvals.findbyId(approvalId);
//   const typUid = approval.UUID;
//   const params = {
//     type: 'CqcStatusChange',
//     typeUid: typUid,
//     userUid: userUid
//   };
//   const users = await notifications.getAllUser({establishmentId: establishmentId});
//   await Promise.all(users.map(async (user) => {
//     const userparams = {
//       ...params,
//       recipientUserUid: user.UserUID,
//       notificationUid: uuid.v4(),
//     };
//     await notifications.insertNewNotification(userparams);
//   }));
// };

router.route('/').post(cqcStatusChanges);
router.route('/').get(getCqcStatusChanges);


module.exports = router;
module.exports.cqcStatusChanges = cqcStatusChanges;
module.exports.getCqcStatusChanges = getCqcStatusChanges;


module.exports.cqcStatusChangeApprovalConfirmation = cqcStatusChangeApprovalConfirmation;
module.exports.cqcStatusChangeRejectionConfirmation = cqcStatusChangeRejectionConfirmation;

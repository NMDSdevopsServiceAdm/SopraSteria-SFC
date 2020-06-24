const express = require('express');
const router = express.Router();
const models = require('../../models');
const moment = require('moment-timezone');
const config = require('../../config/config');

const getApprovalRequest = async (req, res) => {
  const establishmentId = req.params.establishmentId;
  const approvalType = req.query.type;
  const status = req.query.status;
  try {
    let approvalResult = await models.Approvals.findbyEstablishmentId(establishmentId, approvalType, status);
    if (approvalResult) {
      let parentRequests = await _mapResults([approvalResult]);
      return res.status(200).json(parentRequests[0]);
    } else {
      return res.status(200).json(null);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
};

const _mapResults = async (approvalResults) => {
  return approvalResults.map(approval => {
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
        data: approval.Data
      };
    }
  );
};

const becomeAParent = require('./becomeAParent');
router.use('/become-a-parent', becomeAParent);

// urls will look like this: api/approvals/establishment/${establishmentId}?type=becomeaparent&status=pending
router.route('/establishment/:establishmentId').get(getApprovalRequest);

module.exports = router;
module.exports.getApprovalRequest = getApprovalRequest;


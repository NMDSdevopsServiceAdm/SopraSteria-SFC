const express = require('express');
const router = express.Router();
const models = require('../../models');
const isAuthorised = require('../../utils/security/isAuthenticated').isAuthorised;
const moment = require('moment-timezone');
const config = require('../../config/config');

const validateBecomeAParentRequest = async (req, res, next) => {
  try {
    const user = await models.user.findByUUID(req.userUid);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const establishment = await models.establishment.findByPk(req.establishment.id);
    if (!establishment) {
      return res.status(404).json({
        message: 'Establishment not found.',
      });
    }

    const canRequestToBecomeAParent = await models.Approvals.canRequestToBecomeAParent(req.establishment.id)
    if (canRequestToBecomeAParent === false) {
      return res.status(422).json({
        message: 'There is already an existing Become a Parent request.',
      });
    }

    req.userId = user.id;

    next();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      'message': 'Something went wrong validating the Become a Parent request.',
    });
  }
};

const getParentRequestByEstablishmentId = async (req, res) => {
  try {
    let approvalResult = await models.Approvals.findbyEstablishmentId(req.params.establishmentId, 'BecomeAParent', 'Pending');
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

const becomeAParentEndpoint = async (req, res) => {
  const becomeAParentRequest = await models.Approvals.createBecomeAParentRequest(req.userId, req.establishment.id);

  res.send(becomeAParentRequest);
};

router.route('/').post([isAuthorised, validateBecomeAParentRequest, becomeAParentEndpoint]);
router.route('/establishment/:establishmentId').get(getParentRequestByEstablishmentId);

module.exports = router;
module.exports.validateBecomeAParentRequest = validateBecomeAParentRequest;
module.exports.becomeAParentEndpoint = becomeAParentEndpoint;
module.exports.getParentRequestByEstablishmentId = getParentRequestByEstablishmentId;

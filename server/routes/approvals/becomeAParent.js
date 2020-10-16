const express = require('express');
const router = express.Router();
const models = require('../../models');
const isAuthorised = require('../../utils/security/isAuthenticated').isAuthorised;

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

    const canRequestToBecomeAParent = await models.Approvals.canRequestToBecomeAParent(req.establishment.id);
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
      message: 'Something went wrong validating the Become a Parent request.',
    });
  }
};

const becomeAParentEndpoint = async (req, res) => {
  const becomeAParentRequest = await models.Approvals.createBecomeAParentRequest(req.userId, req.establishment.id);

  res.send(becomeAParentRequest);
};

router.route('/').post([isAuthorised, validateBecomeAParentRequest, becomeAParentEndpoint]);

module.exports = router;
module.exports.validateBecomeAParentRequest = validateBecomeAParentRequest;
module.exports.becomeAParentEndpoint = becomeAParentEndpoint;

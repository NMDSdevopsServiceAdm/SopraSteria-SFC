// default route for accepting/rejecting change ownership request
const express = require('express');
const router = express.Router();
const models = require('../../models');
const OwnershipChangeRequest = require('../../models/classes/ownershipChangeRequest');
const Authorization = require('../../utils/security/isAuthenticated');

router.use('/:id', Authorization.isAuthorised);
// PUT request for ownership change request approve/reject
router.route('/:id').put(async (req, res) => {
  try {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    const approvalStatusArr = ['APPROVED', 'DENIED'];
    if (!uuidRegex.test(req.params.id.toUpperCase())) {
      console.error('Invalid ownership change request UUID');
      return res.status(400).send();
    } else if (approvalStatusArr.indexOf(req.body.approvalStatus) === -1) {
      console.error('Approval status would be APPROVED/DENIED');
      return res.status(400).send();
    } else {
      // Get ownership change details
      const thisOwnershipChangeRequest = new OwnershipChangeRequest(req);
      const isOwnerChanged = await thisOwnershipChangeRequest.checkOwnershipChangeRequestUID(req.params.id);
      if (isOwnerChanged) {
          if (isOwnerChanged.response) {
            res.status(200);
            res.json(isOwnerChanged.response);
          } else {
            return res.status(isOwnerChanged.status).send(isOwnerChanged.message);
          }

      }
    }
  } catch (e) {
    console.error('/ownershipRequest/:id: ERR: ', e.message);
    return res.status(503).send({});
  }
});

module.exports = router;

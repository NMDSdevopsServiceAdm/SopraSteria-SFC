// default route for accepting/rejecting change ownership request
const express = require('express');
const router = express.Router();
const models = require('../../models');
const uuid = require('uuid');
const ownership = rfr('server/data/ownership');
const notifications = rfr('server/data/notifications');
const Authorization = require('../../utils/security/isAuthenticated');

router.use('/:id', Authorization.isAuthorised);
// PUT request for ownership change request approve/reject
router.route('/:id').put(async (req, res) => {
  try {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    const approvalStatusArr = ['APPROVED', 'DENIED'];
    const id = req.params.id;
    const params = {
      ownerRequestChangeUid: id,
      userUid: req.userUid,
      approvalStatus: req.body.approvalStatus,
      approvalReason: req.body.approvalReason,
      type: req.body.type,
    };
    if (!id) {
      console.error('Missing id or uid');
      return res.status(400).send();
    } else if (!uuidRegex.test(id.toUpperCase())) {
      console.error('Invalid ownership change request UUID');
      return res.status(400).send();
    } else if (approvalStatusArr.indexOf(req.body.approvalStatus) === -1) {
      console.error('Approval status should be APPROVED/DENIED');
      return res.status(400).send();
    } else {
      let checkOwnerChangeRequestQuery = {
        ownerChangeRequestUID: id,
      };
      const checkOwnerChangeRequest = await ownership.checkOwnershipRquestId(checkOwnerChangeRequestQuery);
      if (!checkOwnerChangeRequest.length) {
        return res.status(404).send('Ownership change request id not found');
      } else if (checkOwnerChangeRequest[0].approvalStatus !== 'REQUESTED') {
        return res.status(400).send('Ownership is already approved/rejected');
      } else {
        params.subEstablishmentID = checkOwnerChangeRequest[0].subEstablishmentID;
        if (params.subEstablishmentID) {
          params.establishmentId = req.establishment.id;
        }
        let getRecipientUserDetails = await ownership.getRecipientUserDetails(params);
        if (getRecipientUserDetails.length) {
          //save records
          params.recipientUserUid = getRecipientUserDetails[0].UserUID;
        }
        const updateChangeRequest = await ownership.updateChangeRequest(params);
        if (!updateChangeRequest) {
          return res.status(400).send('Invalid request');
        }
        params.exsistingNotificationUid = req.body.exsistingNotificationUid;
        let updatedNotificationResp = await notifications.updateNotification(params);
        if (updatedNotificationResp) {
          let resp = await ownership.getUpdatedOwnershipRequest(params);
          return res.status(201).send(resp[0]);
        }
        else {
          return res.status(400).send('Invalid request');
        }
      }
    }
  } catch (e) {
    console.error('/ownershipRequest/:id: ERR: ', e.message);
    return res.status(503).send({});
  }
});

module.exports = router;

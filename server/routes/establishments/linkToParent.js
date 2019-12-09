'use strict';
const express = require('express');
const router = express.Router();
const Establishment = require('../../models/classes/establishment');
const uuid = require('uuid');
const notifications = rfr('server/data/notifications');
const linkSubToParent = rfr('server/data/linkToParent');

router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  try {
    if (await thisEstablishment.restore(establishmentId)) {
      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      const isValidEstablishment = await thisEstablishment.load(req.body);
      if (!isValidEstablishment) {
        return res.status(400).send('Unexpected Input.');
      }
      const params = {
        userUid: req.userUid,
        subEstablishmentId: req.establishmentId,
        permissionRequest: req.body.permissionToSet,
        parentWorkplaceUId: req.body.parentWorkplaceId,
        approvalStatus: 'REQUESTED',
        rejectionReason: null,
      };
      let checkAlreadyRequestedLinkToParent = await linkSubToParent.checkAlreadyRequestedLinkToParent(params);
      if (checkAlreadyRequestedLinkToParent.length) {
        return res.status(400).send({
          message: `Link to parent is already requested for posted establishment id`,
        });
      }
      let parentEstablishmentId = await thisEstablishment.fetchParentDetails(params.parentWorkplaceUId);
      if (parentEstablishmentId) {
        params.parentEstablishmentId = parentEstablishmentId.id;
        params.linkToParentUID = uuid.v4();
        if (!uuidRegex.test(params.linkToParentUID.toUpperCase())) {
          console.error('Invalid link to parent request UUID');
          return res.status(400).send();
        }
      } else {
        return res.status(400).send({
          message: 'Invalid request',
        });
      }
      let linkToParentRequest = await linkSubToParent.linkToParentRequest(params);
      if (linkToParentRequest) {
        let saveLinkToParentRequested = await thisEstablishment.updateLinkToParentRequested(params.subEstablishmentId);
        if (saveLinkToParentRequested) {
          let lastLinkToParentRequest = await linkSubToParent.getLinkToParentRequest(params);
          if (lastLinkToParentRequest) {
            let getRecipientUserDetails = await linkSubToParent.getRecipientUserDetails(params);
            if (getRecipientUserDetails.length > 0) {
                for (let i =0; i < getRecipientUserDetails.length; i++) {
                    params.notificationUid = uuid.v4();
                    if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
                      console.error('Invalid notification UUID');
                      return res.status(400).send();
                    }
                    let notificationParams = {
                        notificationUid: params.notificationUid,
                        type: 'LINKTOPARENTREQUEST',
                        ownerRequestChangeUid: params.linkToParentUID,
                        recipientUserUid: getRecipientUserDetails[i].UserUID,
                        userUid: params.userUid,
                      };
                      let addNotificationResp = await notifications.insertNewNotification(notificationParams);
                }
              return res.status(201).send(lastLinkToParentRequest[0]);
            }
          }
        } else {
          return res.status(400).send({
            message: 'Invalid request',
          });
        }
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error('Error occured: ', err);
    return res.status(503).send({});
  }
});

module.exports = router;

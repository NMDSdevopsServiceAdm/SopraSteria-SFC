'use strict';
const express = require('express');
const router = express.Router();
const Establishment = require('../../models/classes/establishment');
const uuid = require('uuid');
const linkSubToParent = require('../../data/linkToParent');
const notifications = require('../../data/notifications');

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
              for (let i = 0; i < getRecipientUserDetails.length; i++) {
                params.notificationUid = uuid.v4();
                if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
                  console.error('Invalid notification UUID');
                  return res.status(400).send();
                }
                let notificationParams = {
                  notificationUid: params.notificationUid,
                  type: 'LINKTOPARENTREQUEST',
                  typeUid: params.linkToParentUID,
                  recipientUserUid: getRecipientUserDetails[i].UserUID,
                  userUid: params.userUid,
                };
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

/**
 * Route will cancel link to Parent Request.
 */
router.route('/cancel').post(async (req, res) => {
  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (req.body.approvalStatus === undefined || req.body.approvalStatus !== 'CANCELLED') {
      console.error('Approval status should be "CANCELLED"');
      return res.status(400).send();
    }
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      const isValidEstablishment = await thisEstablishment.load(req.body);
      if (!isValidEstablishment) {
        return res.status(400).send('Unexpected Input.');
      } else {
        const getLinkToParentUidParams = {
          establishmentId: req.establishmentId,
        };
        let getLinkToParentUid = await linkSubToParent.getLinkToParentUid(getLinkToParentUidParams);
        if (getLinkToParentUid.length > 0) {
          const params = {
            subEstablishmentId: req.establishmentId,
            linkToParentUid: getLinkToParentUid[0].LinkToParentUID,
            approvalStatus: req.body.approvalStatus,
            rejectionReason: null,
          };
          let cancelLinkToParent = await linkSubToParent.updatedLinkToParent(params);
          if (!cancelLinkToParent.length) {
            return res.status(400).send({
              message: `Unable to cancel this request.`,
            });
          } else {
            let saveLinkToParentRequested = await thisEstablishment.updateLinkToParentRequested(
              params.subEstablishmentId,
              true,
            );
            let updateLinkToParent = await linkSubToParent.updateLinkToParent(params);
            if (updateLinkToParent && saveLinkToParentRequested) {
              return res.status(200).send(updateLinkToParent);
            }
          }
        }
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error(' /establishment/:id/linkToParent/cancel : ERR: ', e.message);
    return res.status(503).send({}); //intentionally an empty JSON response
  }
});

/**
 * Route will Approve/Reject link to Parent Request.
 */
router.route('/action').put(async (req, res) => {
  const thisEstablishment = new Establishment.Establishment(req.username);
  try {
    if (await thisEstablishment.restore(req.establishmentId)) {
      const isValidEstablishment = await thisEstablishment.load(req.body);
      if (!isValidEstablishment) {
        return res.status(400).send('Unexpected Input.');
      }
      const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
      const approvalStatusArr = ['APPROVED', 'DENIED'];
      const params = {
        notificationUid: req.body.notificationUid,
        userUid: req.userUid,
        approvalStatus: req.body.approvalStatus,
        rejectionReason: req.body.rejectionReason,
        type: req.body.type,
        subEstablishmentUid: req.body.createdByUserUID,
        subEstablishmentId: req.body.subEstablishmentId,
        parentEstablishmentId: req.body.parentEstablishmentId,
      };

      if (!params.notificationUid) {
        console.error('Missing notificationUid');
        return res.status(400).send();
      } else if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
        console.error('Invalid notification uid');
        return res.status(400).send();
      } else if (approvalStatusArr.indexOf(req.body.approvalStatus) === -1) {
        console.error('Approval status should be APPROVED/DENIED');
        return res.status(400).send();
      } else {
        const checkLinkToParentRequest = await linkSubToParent.checkLinkToParentUid(params);
        if (checkLinkToParentRequest.length === 0) {
          return res.status(404).send('Link to parent request id not found');
        } else if (checkLinkToParentRequest[0].approvalStatus !== 'REQUESTED') {
          return res.status(400).send('Link to parent request is already approved/rejected');
        } else {
          params.linkToParentUid = checkLinkToParentRequest[0].typeUid;
          const updateLinkToParent = await linkSubToParent.updatedLinkToParent(params);
          if (updateLinkToParent) {
            await thisEstablishment.updateLinkToParentRequested(params.subEstablishmentId, true);
            if (params.approvalStatus === 'APPROVED') {
              let getParentUid = await linkSubToParent.getParentUid(params);
              if (getParentUid) {
                let getPermissionRequest = await linkSubToParent.getPermissionRequest(params);
                if (getPermissionRequest) {
                  params.permissionRequest = getPermissionRequest[0].PermissionRequest;
                  params.parentUid = getParentUid[0].EstablishmentUID;
                  await linkSubToParent.updatedLinkToParentId(params);
                }
              }
            }
            const updateNotification = await linkSubToParent.updateNotification(params);
            if (updateNotification) {
              let notificationParams = {
                notificationUid: uuid.v4(),
                type: params.type,
                typeUid: params.linkToParentUid,
                recipientUserUid: params.subEstablishmentUid,
                userUid: params.userUid,
              };
              if (!uuidRegex.test(notificationParams.notificationUid.toUpperCase())) {
                console.error('Invalid notification UUID');
                return res.status(400).send();
              }
              let addNotificationResp = await notifications.insertNewNotification(notificationParams);
              if (addNotificationResp) {
                let notificationDetailsParams = {
                  typeUid: params.linkToParentUid,
                };
                const notificationDetails = await linkSubToParent.getNotificationDetails(notificationDetailsParams);
                if (notificationDetails) {
                  return res.status(201).send(notificationDetails[0]);
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('/establishment/:id/linkToParent/action : ERR: ', e.message);
    return res.status(503).send({});
  }
});

/**
 * Route will De link link Parent from the sub.
 */
router.route('/delink').put(async (req, res) => {
  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      const isValidEstablishment = await thisEstablishment.load(req.body);
      if (!isValidEstablishment) {
        return res.status(400).send('Unexpected Input.');
      } else {
        const params = {
          establishmentId: req.establishmentId,
          userUid: req.userUid,
          parentWorkplaceUId: req.body.parentWorkplaceUId,
        };
        const delinkParent = await linkSubToParent.delinkParent(params);
        if (delinkParent) {
          let parentEstablishmentId = await thisEstablishment.fetchParentDetails(params.parentWorkplaceUId);
          if (parentEstablishmentId) {
            params.parentEstablishmentId = parentEstablishmentId.id;
            params.deLinkToParentUID = uuid.v4();
            if (!uuidRegex.test(params.deLinkToParentUID.toUpperCase())) {
              console.error('Invalid de link to parent request UUID');
              return res.status(400).send();
            }
            let getRecipientUserDetails = await linkSubToParent.getRecipientUserDetails(params);
            for (let i = 0; i < getRecipientUserDetails.length; i++) {
              params.notificationUid = uuid.v4();
              if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
                console.error('Invalid notification UUID');
                return res.status(400).send();
              }
              let notificationParams = {
                notificationUid: params.notificationUid,
                type: 'DELINKTOPARENT',
                typeUid: params.deLinkToParentUID,
                recipientUserUid: getRecipientUserDetails[i].UserUID,
                userUid: params.userUid,
              };
              await notifications.insertNewNotification(notificationParams);
            }
            let lastDeLinkToParentRequest = await linkSubToParent.getLastDeLinkToParentRequest(params);
            if (lastDeLinkToParentRequest) {
              let getParentName = await linkSubToParent.getParentName(params);
              if (getParentName) {
                lastDeLinkToParentRequest[0].parentEstablishmentName = getParentName[0].NameValue;
                return res.status(201).send(lastDeLinkToParentRequest[0]);
              }
            }
          }
        }
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error(' /establishment/:id/linkToParent/delink : ERR: ', e.message);
    return res.status(503).send({}); //intentionally an empty JSON response
  }
});

module.exports = router;

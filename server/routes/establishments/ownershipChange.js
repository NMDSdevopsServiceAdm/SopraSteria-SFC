const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Establishment = require('../../models/classes/establishment');
const notifications = rfr('server/data/notifications');
const ownership = rfr('server/data/ownership');

// POST request for ownership change request
router.route('/').post(async (req, res) => {
  try {
    const permissionRequestArr = ['Workplace', 'Workplace and Staff', 'None'];
    if (permissionRequestArr.indexOf(req.body.permissionRequest) === -1) {
      console.error('Invalid permission request');
      return res.status(400).send();
    }

    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

    const params = {
      ownerRequestChangeUid: uuid.v4(),
      userUid: req.userUid,
      subEstablishmentId: req.establishmentId,
      permissionRequest: req.body.permissionRequest,
    };

    if (!uuidRegex.test(params.ownerRequestChangeUid.toUpperCase())) {
      console.error('Invalid owner change request UUID');
      return res.status(400).send();
    }

    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      if (thisEstablishment.isParent || thisEstablishment._parentId === null || thisEstablishment.archived) {
        return res.status(404).send({
          message: 'Establishment is not a subsidiary',
        });
      } else {
        //check already exists ownership records for posted sub establishment id
        let checkAlreadyRequestedOwnership = await ownership.checkAlreadyRequestedOwnership(params);
        if (checkAlreadyRequestedOwnership.length) {
          return res.status(400).send({
            message: `Ownership is already requested for posted establishment id`,
          });
        }

        params.parentId = thisEstablishment._parentId;
        let getRecipientUserDetails = await ownership.getRecipientUserDetails(params);
        if (getRecipientUserDetails.length) {
          //save records
          params.recipientUserUid = getRecipientUserDetails[0].UserUID;
          params.timeValue = 'NOW()';
          let saveDataOwnershipRequested = await ownership.changedDataOwnershipRequested(params);
          if (!saveDataOwnershipRequested) {
            return res.status(400).send({
              message: 'Invalid request',
            });
          }
          let changeRequestResp = await ownership.changeOwnershipRequest(params);
          if (!changeRequestResp) {
            return res.status(400).send({
              message: 'Invalid request',
            });
          } else {
            params.notificationUid = uuid.v4();
            if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
              console.error('Invalid notification UUID');
              return res.status(400).send();
            }

            let addNotificationResp = await notifications.insertNewNotification(params);
            if (addNotificationResp) {
              let resp = await ownership.lastOwnershipRequest(params);
              return res.status(201).send(resp[0]);
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
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(503).send({}); // intentionally an empty JSON response
  }
});

// PUT request for ownership change request approve/reject
router.route('/').put(async (req, res) => {
  try {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

    // Get establishment details
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      if (thisEstablishment.isParent || thisEstablishment.parentId === null || thisEstablishment.archived) {
        return res.status(404).send({
          message: 'Establishment is not a subsidiary',
        });
      } else {
        const approvalStatusArr = ['APPROVED', 'DENIED'];
        if (approvalStatusArr.indexOf(req.body.approvalStatus) === -1) {
          console.error('Approval status would be APPROVED/DENIED');
          return res.status(400).send();
        }

        const params = {
          userUid: req.userUid,
          subEstablishmentId: req.establishmentId,
          approvalStatus: req.body.approvalStatus,
          approvalReason: req.body.approvalReason,
        };
        //check already exists ownership records for posted sub establishment id with status: "REQUESTED"
        let ownershipDetails = await ownership.ownershipDetails(params);
        if (!ownershipDetails.length) {
          return res.status(404).send({
            message: 'Ownership is not requested',
          });
        } else if (ownershipDetails[0].approvalStatus !== 'REQUESTED') {
          return res.status(400).send({
            message: 'Ownership is already approved/rejected',
          });
        } else {
          params.parentId = thisEstablishment.parentId;
          let getRecipientUserDetails = await ownership.getRecipientUserDetails(params);
          if (getRecipientUserDetails.length) {
            //save records
            params.recipientUserUid = getRecipientUserDetails[0].UserUID;
            params.ownerRequestChangeUid = ownershipDetails[0].ownerChangeRequestUID;
            let changeRequestResp = await ownership.updateOwnershipRequest(params);
            if (!changeRequestResp) {
              return res.status(400).send({
                message: 'Invalid request',
              });
            } else {
              params.notificationUid = uuid.v4();
              if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
                console.error('Invalid notification UUID');
                return res.status(400).send();
              }

              let addNotificationResp = await notifications.insertNewNotification(params);
              if (addNotificationResp) {
                let resp = await ownership.getUpdatedOwnershipRequest(params);
                return res.status(201).send(resp[0]);
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
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(503).send({});
  }
});

// POST request for cancel already requested ownership
router.route('/:id').post(async (req, res) => {
  try {
    if (req.body.approvalStatus === undefined || req.body.approvalStatus !== 'CANCELLED') {
      console.error('Approval status would be "CANCELLED"');
      return res.status(400).send();
    }

    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

    if (!uuidRegex.test(req.params.id.toUpperCase())) {
      console.error('Invalid owner change request UUID');
      return res.status(400).send();
    }

    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      if (thisEstablishment.isParent || thisEstablishment._parentId === null || thisEstablishment.archived) {
        return res.status(404).send({
          message: 'Establishment is not a subsidiary',
        });
      } else {
        const params = {
          ownerRequestChangeUid: req.params.id,
          approvalStatus: req.body.approvalStatus,
          subEstablishmentId: req.establishmentId,
        };
        //check already exists ownership records for posted sub establishment id
        let checkAlreadyRequestedOwnership = await ownership.checkAlreadyRequestedOwnershipWithUID(params);
        if (!checkAlreadyRequestedOwnership.length) {
          return res.status(400).send({
            message: `Ownership details doesn't found or already Approved/Rejected.`,
          });
        } else {
          let changeRequestResp = await ownership.cancelOwnershipRequest(params);
          if (!changeRequestResp) {
            return res.status(400).send({
              message: 'Invalid request',
            });
          } else {
            params.timeValue = null;
            let saveDataOwnershipRequested = await ownership.changedDataOwnershipRequested(params);
            if (!saveDataOwnershipRequested) {
              return res.status(400).send({
                message: 'Invalid request',
              });
            }
            let resp = await ownership.getUpdatedOwnershipRequest(params);
            return res.status(201).send(resp[0]);
          }
        }
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(503).send({}); // intentionally an empty JSON response
  }
});

// GET request to fetch changeownership request Id

router.route('/details').get(async (req, res) => {
  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      if (thisEstablishment.isParent || thisEstablishment._parentId === null || thisEstablishment.archived) {
        return res.status(404).send({
          message: 'Establishment is not a subsidiary',
        });
      } else {
        const params = {
          subEstablishmentId: req.establishmentId,
        };
        let owenershipChangeRequestDetails = await ownership.ownershipDetails(params);

        if (!owenershipChangeRequestDetails.length) {
          return res.status(400).send({
            message: `Ownership change request details not found.`,
          });
        } else {
          return res.status(200).send(owenershipChangeRequestDetails[0]);
        }
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error(' /establishment/:id/ownershipChange/details : ERR: ', e.message);
    return res.status(503).send({}); //intentionally an empty JSON response
  }
});
module.exports = router;

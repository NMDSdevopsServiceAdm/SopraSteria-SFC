// default route for accepting/rejecting change ownership request
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Establishment = require('../../models/classes/establishment');
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
      rejectionReason: req.body.rejectionReason,
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
        params.subEstablishmentId = checkOwnerChangeRequest[0].subEstablishmentID;
        if (params.subEstablishmentId) {
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

        //update establishment dataOwner and dataPermissions property for ownership transfer

        //updating requester establishment details
        let requesterUpdate;
        if (params.approvalStatus !== 'DENIED') {
          let objToUpdate = {
            dataOwner: 'Workplace',
            dataPermissions: 'Workplace and Staff',
          };
          let ownershipRequesterId = await ownership.getownershipRequesterId(req.establishment.id);
        if(ownershipRequesterId && ownershipRequesterId[0].IsParent === false &&  ownershipRequesterId[0].ParentID) {
          owershipRequesterEsatblishmentId = ownershipRequesterId[0].ParentID;
          objToUpdate.dataOwner = 'Parent';
        } else {
          owershipRequesterEsatblishmentId = checkOwnerChangeRequest[0].subEstablishmentID;
        }
          requesterUpdate = await Establishment.Establishment.fetchAndUpdateEstablishmentDetails(
            owershipRequesterEsatblishmentId,
            objToUpdate
          );
        } else {
          requesterUpdate = true;
        }
        if (requesterUpdate) {
          let recieverUpdate;
          if (params.approvalStatus !== 'DENIED') {
            //updating reciever establishment details
            objToUpdate = {
              dataOwner: 'Workplace',
              dataPermissions: checkOwnerChangeRequest[0].permissionRequest,
            };

            recieverUpdate = await Establishment.Establishment.fetchAndUpdateEstablishmentDetails(
              req.establishment.id,
              objToUpdate,
              true
            );
          } else {
            let recieverEstablishmentDetails = new Establishment.Establishment(req.username);
            if (await recieverEstablishmentDetails.restore(req.establishment.id, false)) {
              recieverUpdate = recieverEstablishmentDetails;
            }
          }

          if (recieverUpdate) {
            params.exsistingNotificationUid = req.body.exsistingNotificationUid;
            let updateNotificationParam = {
              exsistingNotificationUid: params.exsistingNotificationUid,
              ownerRequestChangeUid: params.ownerRequestChangeUid,
              recipientUserUid: recieverUpdate.dataOwner !== 'Parent' ? req.userUid : params.recipientUserUid,
            };
            let updatedNotificationResp = await notifications.updateNotification(updateNotificationParam);
            if (updatedNotificationResp) {
              let resp = await ownership.getUpdatedOwnershipRequest(params);
              if (resp) {
                // requester useruid to send notification in case his request for swap ownership gets approved or rejected
                params.recipientUserUid = resp[0].createdByUserUID;
                params.notificationUid = uuid.v4();
                params.type = 'OWNERCHANGE';
                if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
                  console.error('Invalid notification UUID');
                  return res.status(400).send();
                }
                //inserting new notification for requester to let him know his request is Approved or Denied
                let addNotificationResp = await notifications.insertNewNotification(params);
                if (!addNotificationResp) {
                  return res.status(400).send('Invalid request');
                } else {
                  //clearing ownership requested column
                  let clearOwnershipParam = {
                    timeValue: null,
                    subEstablishmentId: params.subEstablishmentId,
                  };
                  let saveDataOwnershipRequested = await ownership.changedDataOwnershipRequested(clearOwnershipParam);
                  if (!saveDataOwnershipRequested) {
                    return res.status(400).send({
                      message: 'Invalid request',
                    });
                  }
                }
              }
              return res.status(201).send(resp[0]);
            } else {
              return res.status(400).send('Invalid request');
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('/ownershipRequest/:id: ERR: ', e.message);
    return res.status(503).send({});
  }
});

module.exports = router;

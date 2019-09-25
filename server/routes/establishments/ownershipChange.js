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
    if(permissionRequestArr.indexOf(req.body.permissionRequest) === -1){
      console.error('Invalid permission request');
      return res.status(400).send();
    }

    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

    const params = {
        ownerRequestChangeUid: uuid.v4(),
        userUid: req.userUid,
        subEstablishmentId: req.establishmentId,
        permissionRequest: req.body.permissionRequest
    };

    if (!uuidRegex.test(params.ownerRequestChangeUid.toUpperCase())){
      console.error('Invalid owner change request UUID');
      return res.status(400).send();
    }

    const thisEstablishment = new Establishment.Establishment(req.username);
    try {
        if (await thisEstablishment.restore(req.establishmentId, false)){
          if(!thisEstablishment){
            return res.status(404).send({
              message: 'Establishment is not found',
            });
          }else if(thisEstablishment.isParent || thisEstablishment._parentId === null || thisEstablishment.archived){
            return res.status(404).send({
              message: 'Establishment is not a subsidiary',
            });
          }else{
            //check already exists ownership records for posted sub establishment id
            let checkAlreadyRequestedOwnership = await ownership.checkAlreadyRequestedOwnership(params);
            if(checkAlreadyRequestedOwnership.length){
              return res.status(400).send({
                  message: `Ownership is already requested for posted establishment id`,
              });
            }

            params.parentId = thisEstablishment._parentId;
            let getRecipientUserDetails = await ownership.getReipientUserDetails(params);
            if(getRecipientUserDetails.length){
              //save records
              params.recipientUserUid = getRecipientUserDetails[0].UserUID;
              let changeRequestResp = await ownership.changeOwnershipRequest(params);
              if(!changeRequestResp){
                  return res.status(400).send({
                      message: 'Invalid request',
                  });
              }else{
                  params.notificationUid = uuid.v4();
                  if (!uuidRegex.test(params.notificationUid.toUpperCase())){
                    console.error('Invalid notification UUID');
                    return res.status(400).send();
                  }

                  let addNotificationResp = await notifications.insertNewNotification(params);
                  if(addNotificationResp){
                      let resp = await ownership.lastOwnershipRequest(params);
                      return res.status(201).send(resp[0]);
                  }
              }
            }
          }
        }
    }
    catch(e){
      console.error("/establishment/:id/actions/ownershipChange: ERR: ", e.message);
      return res.status(503).send({});        // intentionally an empty JSON response
    }
  } catch(e) {
    console.error("/establishment/:id/actions/ownershipChange: ERR: ", e.message);
    return res.status(503).send({});        // intentionally an empty JSON response
  }
});

module.exports = router;

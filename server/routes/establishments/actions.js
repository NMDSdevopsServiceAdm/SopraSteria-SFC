const express = require('express');
const router = express.Router();
const uuid = require('uuid');

const notifications = rfr('server/data/notifications');
const ownership = rfr('server/data/ownership');

// POST request for ownership change request
router.route('/ownershipChange').post(async (req, res) => {
  try {

    const permissionRequestArr = ['Workplace', 'Workplace and Staff', 'None'];
    if(permissionRequestArr.indexOf(req.body.permissionRequest) === -1){
      console.error('Invalid permission request');
      return res.status(400).send();
    }

    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    if (!uuidRegex.test(req.userUId.toUpperCase())){
      console.error('Invalid user UUID');
      return res.status(400).send();
    }

    const params = {
        ownerRequestChangeUid: uuid.v4(),
        userUid: req.userUId,
        subEstablishmentId: req.establishmentId,
        permissionRequest: req.body.permissionRequest
    };

    if (!uuidRegex.test(params.ownerRequestChangeUid.toUpperCase())){
      console.error('Invalid owner change request UUID');
      return res.status(400).send();
    }

    let getEstiblishmentDetails = await ownership.getEstablishmentDetails(params);
    if(!getEstiblishmentDetails.length){
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }

    //check post establishment ID has IsParent value true and has some ParentID
    let checkEstablishmentResult = await ownership.checkEstablishment(params);
    if(!checkEstablishmentResult.length){
        return res.status(400).send({
            message: 'Establishment is not a subsidiary',
          });
    }else{

        //check already exists ownership records for posted sub establishment id
        let checkAlreadyRequestedOwnership = await ownership.checkAlreadyRequestedOwnership(params);
        if(checkAlreadyRequestedOwnership.length){
          return res.status(400).send({
              message: `Ownership is already requested for sub establishment id: ${req.params.id}`,
          });
        }
        //save records
        if (!uuidRegex.test(checkEstablishmentResult[0].UserUID.toUpperCase())){
          console.error('Invalid recepient user UUID');
          return res.status(400).send();
        }

        params.recipientUserUid = checkEstablishmentResult[0].UserUID;
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
  } catch(e) {
    console.error("/establishment/:id/actions/ownershipChange: ERR: ", e.message);
    return res.status(503).send({});        // intentionally an empty JSON response
  }
});

module.exports = router;

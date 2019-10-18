/*
 * ownershipChangeRequest.js
 *
 * The encapsulation of a OwnershipChangeRequest, including all properties, all specific validation (not API, but object validation),
 * saving & restoring of data to database (via sequelize model), construction and deletion.
 *
 * Also includes representation as JSON, in one or more presentations.
 */

const uuid = require('uuid');
const ownership = rfr('server/data/ownership');
const notifications = rfr('server/data/notifications');
class OwnershipChangeRequest {
  constructor(ownershipChangeRequest) {
    this._ownerChangeRequest = ownershipChangeRequest;
  }
  // this method will check if ownershipChangeRequestUID exsist or not
  async checkOwnershipChangeRequestUID(id) {
    if (!id) {
      console.error('Missing id or uid');
    }
    let res = {
        status: Number,
        message: String,
    }
    try {
      const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
      const params = {
        ownerRequestChangeUid: id,
        userUid: this._ownerChangeRequest.userUid,
        approvalStatus: this._ownerChangeRequest.body.approvalStatus,
        approvalReason: this._ownerChangeRequest.body.approvalReason,
      };
      let checkownerChangeRequestQuery = {
        ownerChangeRequestUID: id,
      };
      const checkownerChangeRequest = await ownership.checkOwnershipRquestId(checkownerChangeRequestQuery);
      if (!checkownerChangeRequest.length) {
        let res = {
            status: '404',
            message: 'Ownership change request id not found',
        };
        return res;
      } else if (checkownerChangeRequest[0].approvalStatus !== 'REQUESTED') {
        let res = {
            status: '400',
            message: 'Ownership is already approved/rejected',
        };
        return res;
      } else {
        if (checkownerChangeRequest.length) {
          params.subEstablishmentID = checkownerChangeRequest[0].subEstablishmentID;
        }
        if (params.subEstablishmentID) {
          const checkParent = await ownership.getParentDetails(params);
          if (checkParent && !checkParent[0].IsParent) {
            params.parentId = checkParent[0].ParentID;
          } else {
            params.parentId = this._ownerChangeRequest.establishment.id;
          }
        }

        let getRecipientUserDetails = await ownership.getReipientUserDetails(params);
        if (getRecipientUserDetails.length) {
          //save records
          params.recipientUserUid = getRecipientUserDetails[0].UserUID;
        }
        const updateChangeRequest = await ownership.updateChangeRequest(params);
        if (!updateChangeRequest) {
            let res = {
                status: '400',
                message: 'Invalid request',
            };
          return res;
        } else {
          params.notificationUid = uuid.v4();
          if (!uuidRegex.test(params.notificationUid.toUpperCase())) {
            console.error('Invalid notification UUID');
            let res = {
                status: '400',
                message: 'Invalid notification UUID',
            };
          return res;
          }
        }
        let addNotificationResp = await notifications.insertNewNotification(params);
        if (addNotificationResp) {
          let resp = await ownership.getUpdatedOwnershipRequest(params);
          let res = {
            status: '200',
            message: 'Approved/Rejected Successfully',
            response: resp[0]
        };
      return res;
        } else {
            let res = {
                status: '400',
                message: 'Invalid request',
            };
          return res;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = OwnershipChangeRequest;

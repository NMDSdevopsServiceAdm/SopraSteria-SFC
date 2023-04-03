const ownership = require('../../data/ownership');
const Establishment = require('../../models/classes/establishment');
const uuid = require('uuid');
const notifications = require('../../data/notifications');
const models = require('../../models');
const { isAdminRole } = require('../../utils/adminUtils');
const HttpError = require('../../utils/errors/httpError');

class OwnershipChange {
  static async ActionRequest(req) {
    const requestId = req.params.id;
    this.validateApprovalStatus(req.body.approvalStatus);
    const ownershipRequest = await this.getCurrentOwnershipRequest(req.params.id);

    const updateParams = {
      ownerRequestChangeUid: requestId,
      userUid: req.userUid,
      approvalStatus: req.body.approvalStatus,
      rejectionReason: req.body.rejectionReason,
      type: req.body.type,
    };
    await this.updateOwnershipRequest(updateParams);

    const updateEstablishmentParams = {
      approvalStatus: req.body.approvalStatus,
      establishmentId: req.establishmentId,
      username: req.username,
      ownershipRequest: ownershipRequest,
    };
    const establishmentUpdated = await this.updateEstablishment(updateEstablishmentParams);

    if (establishmentUpdated) {
      const requestorUid = await this.getRequestorEstablishmentUid(requestId);
      const notificationParams = {
        existingNotificationUid: req.body.existingNotificationUid,
        ownerRequestChangeUid: requestId,
        establishmentUid: req.establishment.uid,
        requestorUid: requestorUid,
        subEstablishmentId: ownershipRequest.subEstablishmentID,
        type: 'OWNERCHANGE',
        userUid: req.userUid,
        approvalStatus: req.body.approvalStatus,
        rejectionReason: req.body.rejectionReason,
      };

      const response = await this.updateAndSendNotifications(notificationParams);
      console.log(response);
      return { statusCode: 201, response: response };
    }
  }

  static async CreateRequest(req) {
    this.validateRequestType(req.body.permissionRequest);

    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      this.validateIsSubsidiary(thisEstablishment);
      //check already exists ownership records for posted sub establishment id
      if (await this.checkAlreadyRequested(req.establishmentId)) {
        throw new HttpError('Ownership is already requested for posted establishment id', 400);
      }

      const recipientParams = {
        establishmentId: req.establishmentId,
        dataOwner: thisEstablishment._dataOwner,
      };

      const recipientEstablishmentUid = await this.getRecipientUid(recipientParams);
      if (recipientEstablishmentUid) {
        const params = {
          establishmentId: req.establishmentId,
          permissionRequest: req.body.permissionRequest,
          userUid: req.userUid,
          recipientEstablishmentUid: recipientEstablishmentUid,
        };
        const resp = await this.createRequestAndNotify(params);
        return { status: 201, response: resp[0] };
      }
      if (isAdminRole(req.role)) {
        try {
          let workplace = await models.establishment.findbyId(req.establishmentId);
          if (workplace) {
            workplace.dataOwner = 'Parent';
            workplace.dataPermissions = req.body.permissionRequest;
            await workplace.save();
            return { status: 200, response: '' };
          } else {
            throw new HttpError('Establishment is not found', 404);
          }
        } catch (err) {
          throw new HttpError({ statusCode: 500 });
        }
      }
    } else {
      throw new HttpError('Establishment is not found', 404);
    }
  }

  static async CancelRequest(req) {
    this.validateIsCancelled(req.body.approvalStatus);
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      this.validateIsSubsidiary(thisEstablishment);

      if (await !this.checkAlreadyRequested(req.establishmentId)) {
        throw new HttpError('Ownership details cannot be found or already Approved/Rejected.', 400);
      }

      const params = {
        ownerRequestChangeUid: req.params.id,
        approvalStatus: req.body.approvalStatus,
      };

      const requestedTimestampParams = {
        establishmentId: req.establishmentId,
        timeStamp: null,
      };

      await this.cancelOwnershipRequest(params);
      await this.setOwnershipRequestedTimestamp(requestedTimestampParams);

      const resp = await ownership.getUpdatedOwnershipRequest(params);
      return { statusCode: 200, response: resp[0] };
    } else {
      throw new HttpError('Establishment is not found', 404);
    }
  }

  static async GetRequest(req) {
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      this.validateIsSubsidiary(thisEstablishment);
      const getRecipientUserDetailsParams = {
        userUid: req.userUid,
        establishmentId: req.establishmentId,
        permissionRequest: req.body.permissionRequest,
      };
      let getRecipientUserDetails;
      if (thisEstablishment._dataOwner !== 'Parent') {
        getRecipientUserDetails = await ownership.getRecipientSubUserDetails(getRecipientUserDetailsParams);
      } else {
        getRecipientUserDetails = await ownership.getRecipientUserDetails(getRecipientUserDetailsParams);
      }
      if (getRecipientUserDetails.length > 0) {
        const params = {
          subEstablishmentId: req.establishmentId,
          limit: getRecipientUserDetails.length,
        };
        let ownershipChangeRequestDetails = await ownership.ownershipDetails(params);

        if (!ownershipChangeRequestDetails.length) {
          throw new HttpError('Ownership change request details not found.', 400);
        } else {
          return { statusCode: 200, response: ownershipChangeRequestDetails };
        }
      }
    } else {
      throw new HttpError('Establishment is not found', 404);
    }
  }

  static async cancelOwnershipRequest(params) {
    let changeRequestResp = await ownership.cancelOwnershipRequest(params);
    if (!changeRequestResp) {
      throw new HttpError('Invalid request', 400);
    }
  }

  static async createRequestAndNotify(params) {
    const ownerRequestChangeUid = uuid.v4();

    const requestParams = {
      ownerRequestChangeUid: ownerRequestChangeUid,
      subEstablishmentId: params.establishmentId,
      permissionRequest: params.permissionRequest,
      userUid: params.userUid,
    };
    await this.createChangeOwnershipRequest(requestParams);

    const notificationParams = {
      notificationContentUid: ownerRequestChangeUid,
      establishmentUid: params.recipientEstablishmentUid,
      userUid: params.userUid,
      type: 'OWNERCHANGE',
    };
    await notifications.insertNewEstablishmentNotification(notificationParams);

    const requestedTimestampParams = {
      establishmentId: params.establishmentId,
      timeStamp: 'NOW()',
    };
    await this.setOwnershipRequestedTimestamp(requestedTimestampParams);
    return await ownership.lastOwnershipRequest(params.establishmentId);
  }

  static async checkAlreadyRequested(subEstablishmentId) {
    let checkAlreadyRequestedOwnership = await ownership.checkAlreadyRequestedOwnership(subEstablishmentId);
    return checkAlreadyRequestedOwnership.length ? true : false;
  }

  static async createChangeOwnershipRequest(params) {
    let changeRequestResp = await ownership.createChangeOwnershipRequest(params);
    if (!changeRequestResp) {
      throw new HttpError('Invalid request', 400);
    }
  }

  static async getCurrentOwnershipRequest(id) {
    const params = { ownerChangeRequestUID: id };
    const checkOwnerChangeRequest = await ownership.checkOwnershipRequestId(params);
    if (!checkOwnerChangeRequest.length) {
      throw new HttpError('Ownership change request id not found', 404);
    } else if (checkOwnerChangeRequest[0].approvalStatus !== 'REQUESTED') {
      throw new HttpError('Ownership is already approved/rejected', 400);
    }
    return checkOwnerChangeRequest[0];
  }

  static async getRequestorEstablishmentUid(ownershipChangeUid) {
    const response = await ownership.getRequestorEstablishment(ownershipChangeUid);
    if (response) {
      return response[0].establishmentUid;
    }
    throw new HttpError({ statusCode: 400 });
  }

  static async getUpdatedOwnershipRequest(params) {
    const response = await ownership.getUpdatedOwnershipRequest(params);
    if (response) {
      return response[0];
    }
    throw new HttpError('Invalid request', 400);
  }

  static async getRecipientUid(params) {
    let response;
    if (params.dataOwner !== 'Parent') {
      response = await ownership.getRecipientSubEstablishmentDetails(params);
    } else {
      response = await ownership.getRecipientEstablishmentDetails(params);
    }
    return response[0].establishmentUid;
  }

  static async updateEstablishment(params) {
    if (params.approvalStatus !== 'DENIED') {
      return await this.updateEstablishmentDetails(params);
    } else {
      let recieverEstablishmentDetails = new Establishment.Establishment(params.username);
      if (await recieverEstablishmentDetails.restore(params.establishmentId, false)) {
        return recieverEstablishmentDetails;
      }
    }
  }

  static async updateAndSendNotifications(params) {
    console.log('************ UPDATE EXISTING NOTIFICATION *************');
    console.log(params);
    await this.updateExistingNotification(params);
    const updatedOwnershipRequest = await this.getUpdatedOwnershipRequest(params);
    const newNotificationParams = {
      establishmentUid: params.requestorUid,
      type: params.type,
      notificationContentUid: params.ownerRequestChangeUid,
      userUid: params.userUid,
    };
    console.log('INSERT NEW NOTIFICATION');
    console.log(newNotificationParams);
    await notifications.insertNewEstablishmentNotification(newNotificationParams);
    console.log('SUCCESS');
    const setTimestampParams = {
      timeStamp: null,
      establishmentId: params.subEstablishmentId,
    };
    await this.setOwnershipRequestedTimestamp(setTimestampParams);
    const updateOwnershipRequestParams = {
      ownerRequestChangeUid: params.ownerRequestChangeUid,
      rejectionReason: params.rejectionReason,
      approvalStatus: params.approvalStatus,
      userUid: params.userUid,
    };

    await this.updateOwnershipRequest(updateOwnershipRequestParams);
    return updatedOwnershipRequest;
  }

  static async updateExistingNotification(params) {
    const updatedNotificationResponse = await notifications.updateNotification(params);
    if (!updatedNotificationResponse) {
      throw new HttpError('Invalid request', 400);
    }
  }

  static async setOwnershipRequestedTimestamp(params) {
    let saveDataOwnershipRequested = await ownership.setOwnershipRequestedTimestamp(params);
    if (!saveDataOwnershipRequested) {
      throw new HttpError('Invalid request', 400);
    }
  }

  static async updateOwnershipRequest(params) {
    const updateChangeRequest = await ownership.updateChangeRequest(params);
    if (!updateChangeRequest) {
      throw new HttpError('Invalid request', 400);
    }
  }

  static async updateEstablishmentDetails(params) {
    const currentDataOwnerDetails = await ownership.getownershipRequesterId(params.establishmentId);

    const isSubsidiary = currentDataOwnerDetails[0].IsParent === false && currentDataOwnerDetails[0].ParentID;

    console.log(currentDataOwnerDetails);
    console.log('IS SUBSIDIARY: ' + isSubsidiary);

    const workplaceEstablishmentId = isSubsidiary ? params.establishmentId : params.ownershipRequest.subEstablishmentID;

    const updateDetails = {
      dataPermissions: params.ownershipRequest.permissionRequest,
      dataOwner: isSubsidiary ? 'Parent' : 'Workplace',
    };

    return await Establishment.Establishment.fetchAndUpdateEstablishmentDetails(
      workplaceEstablishmentId,
      updateDetails,
    );
  }

  static validateApprovalStatus(approvalStatus) {
    const approvalStatusArr = ['APPROVED', 'DENIED'];
    if (approvalStatusArr.indexOf(approvalStatus) === -1) {
      throw new HttpError('Approval status should be APPROVED/DENIED', 400);
    }
  }

  static validateIsCancelled(status) {
    if (status === undefined || status !== 'CANCELLED') {
      console.error('Approval status should be "CANCELLED"');
      throw new HttpError({ statusCode: 400 });
    }
  }

  static async validateIsSubsidiary(establishment) {
    if (establishment.isParent || establishment._parentId === null || establishment.archived) {
      throw new HttpError('Establishment is not a subsidiary', 404);
    }
  }

  static validateRequestType(request) {
    const permissionRequestArr = ['Workplace', 'Workplace and Staff', 'None'];
    if (permissionRequestArr.indexOf(request) === -1) {
      console.error('Invalid permission request');
      throw new HttpError({ statusCode: 400 });
    }
  }
}

module.exports = OwnershipChange;

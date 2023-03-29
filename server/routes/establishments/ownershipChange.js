const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Establishment = require('../../models/classes/establishment');
const notifications = require('../../data/notifications');
const ownership = require('../../data/ownership');
const models = require('../../models');
const { isAdminRole } = require('../../utils/adminUtils');

class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class OwnershipChange {
  static async CreateRequest(req) {
    this.validateRequestType(req.body.permissionRequest);

    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      this.validateIsSubsidiary(thisEstablishment);
      //check already exists ownership records for posted sub establishment id
      if (await this.checkAlreadyRequested(req.establishmentId)) {
        throw new HttpError('Ownership is already requested for posted establishment id', 400);
      }

      const recipientParams = { establishmentId: req.establishmentId };

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
            return { statusCode: 200 };
          } else {
            throw new HttpError('Establishment is not found', 404);
          }
        } catch (err) {
          throw new HttpError({ statusCode: 500 });
        }
      }
      throw new HttpError('Establishment is not found', 404);
    }
  }

  static async CancelRequest(req) {
    this.validateApprovalStatus(req.body.approvalStatus);

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

      await this.cancelOwnershipRequest(params);

      const requestedTimestampParams = {
        establishmentId: req.establishmentId,
        timeStamp: null,
      };
      await this.setOwnershipRequestedTimestamp(requestedTimestampParams);

      const resp = await ownership.getUpdatedOwnershipRequest(params);
      return { statusCode: 200, response: resp[0] };
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
      permReq: params.permissionRequest,
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
      subEstablishmentId: params.establishmentId,
      timeValue: 'NOW()',
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

  static validateApprovalStatus(status) {
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

  static async getRecipientUid(params) {
    const response = await ownership.getRecipientEstablishmentDetails(params);
    return response[0].establishmentUid;
  }

  static async setOwnershipRequestedTimestamp(params) {
    let saveDataOwnershipRequested = await ownership.setOwnershipRequestedTimestamp(params);
    if (!saveDataOwnershipRequested) {
      throw new HttpError('Invalid request', 400);
    }
  }
}

// POST request for ownership change request
const ownershipChangeRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.CreateRequest(req);
    return res.status(resp.status).send(resp.response);
  } catch (e) {
    if (typeof e === HttpError) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

// POST request for cancel already requested ownership
const cancelOwnershipChangeRequest = async (req, res) => {
  try {
    const resp = await OwnershipChange.CancelRequest(req);
    return res.status(resp.statusCode).send(resp.response);
  } catch (e) {
    if (typeof e === HttpError) {
      return res.status(e.statusCode).send({ message: e.message });
    }
    console.error('/establishment/:id/ownershipChange: ERR: ', e.message);
    return res.status(500).send({}); // intentionally an empty JSON response
  }
};

// GET request to fetch changeownership request Id
const getOwnershipChangeRequest = async (req, res) => {
  try {
    const thisEstablishment = new Establishment.Establishment(req.username);
    if (await thisEstablishment.restore(req.establishmentId, false)) {
      if (thisEstablishment.isParent || thisEstablishment._parentId === null || thisEstablishment.archived) {
        return res.status(404).send({
          message: 'Establishment is not a subsidiary',
        });
      } else {
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
          let owenershipChangeRequestDetails = await ownership.ownershipDetails(params);

          if (!owenershipChangeRequestDetails.length) {
            return res.status(400).send({
              message: 'Ownership change request details not found.',
            });
          } else {
            return res.status(200).send(owenershipChangeRequestDetails);
          }
        }
      }
    } else {
      return res.status(404).send({
        message: 'Establishment is not found',
      });
    }
  } catch (e) {
    console.error(' /establishment/:id/ownershipChange/details : ERR: ', e.message);
    return res.status(500).send({}); //intentionally an empty JSON response
  }
};

router.route('/').post(ownershipChangeRequest);
router.route('/details').get(getOwnershipChangeRequest);
router.route('/:id').post(cancelOwnershipChangeRequest);

module.exports = router;

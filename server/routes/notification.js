// default route for user endpoint
const express = require('express');
const router = express.Router();

const Authorization = require('../utils/security/isAuthenticated');
const models = require('../models');
const linkSubToParent = require('../data/linkToParent');
const ownershipChangeRequests = require('../data/ownership');
const notifications = require('../data/notifications');

/**
 * Method will fetch the notification details.
 * @param notification
 */
const getNotificationTypes = async (req, res) => {
  const notificationTypes = await notifications.getNotificationTypes();
  return res.status(200).send(notificationTypes);
};

const createNotificationType = async (req, res) => {
  try {
    if (req.params === null) {
      return res.status(400).send({ message: 'No new type was provided' });
    }

    await notifications.createNotificationType(req.body);

    const newType = notifications.selectNotificationTypeByTypeName(req.body.type);
    return res.status(200).send(newType);
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
};

const getEstablishmentNotifications = async (req, res) => {
  const establishmentNotifications = await notifications.selectNotificationByEstablishment(req.params.establishmentUid);
  return res.status(200).send(establishmentNotifications);
};

/**
 * Method will fetch the notification details.
 * @param notification
 */
const getNotificationDetails = async (notification) => {
  const notificationDetails = await linkSubToParent.getLinkToParentDetails(notification);
  const subEstablishmentName = await linkSubToParent.getSubEstablishmentName(notification);
  if (subEstablishmentName) {
    notificationDetails[0].subEstablishmentName = subEstablishmentName[0].subEstablishmentName;
    notificationDetails[0].subEstablishmentId = subEstablishmentName[0].subestablishmentid;
    notificationDetails[0].parentEstablishmentId = subEstablishmentName[0].parentestablishmentid;
    notificationDetails[0].rejectionReason = subEstablishmentName[0].rejectionreason;
  }
  return notificationDetails;
};

const addTypeContent = async (notification) => {
  console.log(notification);
  notification.typeContent = {};

  switch (notification.type) {
    case 'OWNERCHANGE': {
      const subQuery = await ownershipChangeRequests.getOwnershipNotificationDetails({
        ownerChangeRequestUid: notification.notificationContentUid,
      });
      console.log(subQuery);
      if (subQuery.length === 1) {
        if (subQuery[0].createdByUserUID) {
          const requestorName = await notifications.getRequesterName(notification.createdByUserUID);
          if (requestorName) {
            subQuery.forEach(function (element) {
              element.requestorName = requestorName[0].NameValue;
            });
          }
          // fetch reject reason if available
          let rejectionReasonParam = {
            ownerRequestChangeUid: subQuery[0].ownerChangeRequestUID,
          };
          let rejectionReason = await ownershipChangeRequests.getUpdatedOwnershipRequest(rejectionReasonParam);
          if (rejectionReason.length === 1 && rejectionReason[0].approvalStatus === 'DENIED') {
            subQuery.forEach(function (element) {
              element.rejectionReason = rejectionReason[0].approvalReason;
            });
          }
        }
        notification.typeContent = subQuery[0];
      }
      break;
    }
    case 'LINKTOPARENTREQUEST': {
      let fetchNotificationDetails = await getNotificationDetails(notification);
      if (fetchNotificationDetails) {
        fetchNotificationDetails[0].requestorName = fetchNotificationDetails[0].subEstablishmentName;
        notification.typeContent = fetchNotificationDetails[0];
      }
      break;
    }
    case 'LINKTOPARENTAPPROVED': {
      let fetchApprovedNotificationDetails = await getNotificationDetails(notification);
      if (fetchApprovedNotificationDetails) {
        fetchApprovedNotificationDetails[0].requestorName = fetchApprovedNotificationDetails[0].parentEstablishmentName;
        notification.typeContent = fetchApprovedNotificationDetails[0];
      }
      break;
    }
    case 'LINKTOPARENTREJECTED': {
      let fetchRejectNotificationDetails = await getNotificationDetails(notification);
      if (fetchRejectNotificationDetails) {
        fetchRejectNotificationDetails[0].requestorName = fetchRejectNotificationDetails[0].parentEstablishmentName;
        notification.typeContent = fetchRejectNotificationDetails[0];
      }
      break;
    }
    case 'DELINKTOPARENT': {
      let deLinkNotificationDetails = await notifications.getRequesterName(notification.createdByUserUID);
      if (deLinkNotificationDetails) {
        let deLinkParentDetails = await notifications.getDeLinkParentDetails(notification.notificationContentUid);
        if (deLinkParentDetails) {
          let deLinkParentName = await notifications.getDeLinkParentName(deLinkParentDetails[0].EstablishmentID);
          if (deLinkParentName) {
            notification.typeContent.parentEstablishmentName = deLinkParentName[0].NameValue;
            notification.typeContent.requestorName = deLinkNotificationDetails[0].NameValue;
          }
        }
      }
      break;
    }
    case 'BECOMEAPARENT': {
      let becomeAParentNotificationDetails = await models.Approvals.findbyUuid(notification.notificationContentUid);

      if (becomeAParentNotificationDetails) {
        notification.typeContent = {
          status: becomeAParentNotificationDetails.Status,
        };
      }
      break;
    }
  }

  delete notification.notificationContentUid;
};

const getNotification = async (req, res) => {
  try {
    const notificationData = await getOneNotification(req.params.notificationUid);

    await addTypeContent(notificationData.notification);

    // this will fetch notification receiver name
    if (notificationData.notification.type === 'OWNERCHANGE') {
      const notificationReciever = await ownershipChangeRequests.getNotificationRecieverName(
        notificationData.notification,
      );
      if (notificationReciever.length === 1) {
        notificationData.notification.forEach((element) => {
          element.recieverName = notificationReciever[0].NameValue;
        });
      }
    }
    // return the item
    return res.status(200).send(notificationData.notification);
  } catch (e) {
    console.log(e);
    console.log(req.params);
    return res.status(500).send({
      message: e.message,
    });
  }
};

const getOneNotification = async (notificationUid) => {
  let establishmentNotification = false;
  const params = {
    notificationUid, // and the notificationUid from the url
  };
  let notification = await notifications.selectOneUserNotification(params);
  if (notification.length !== 1) {
    notification = await notifications.selectOneEstablishmentNotification(params);
    establishmentNotification = true;
    if (notification.length !== 1) {
      return notification;
    }
  }

  const notificationData = {
    establishmentNotification: establishmentNotification,
    notification: notification[0],
  };
  console.log(notificationData);
  return notificationData;
};

const setNotificationRead = async (req, res) => {
  try {
    if (req.body.isViewed !== true) {
      return res.status(400).send({
        message: 'The isViewed field is required to be true',
      });
    }

    const params = {
      userUid: req.userUid, //pull the user's uuid out of JWT
      notificationUid: req.params.notificationUid, // and the notificationUid from the url
    };

    const notificationData = await getOneNotification(req.params.notificationUid);

    console.log(params);

    let notification;
    if (notificationData.establishmentNotification) {
      await notifications.markEstablishmentNotificationAsRead(params);
      notification = await notifications.selectOneEstablishmentNotification(params);
    } else {
      await notifications.markUserNotificationAsRead(params);
      notification = await notifications.selectOneUserNotification(params);
    }

    if (notification.length !== 1) {
      return res.status(404).send({
        message: 'Not found',
      });
    }

    await addTypeContent(notification[0]);

    //return the list
    return res.status(200).send(notification[0]);
  } catch (e) {
    return res.status(500).send({ message: e });
  }
};

const sendEstablishmentNotification = async (req, res) => {
  try {
    const typeData = await notifications.selectNotificationTypeByTypeName(req.body.type);
    const params = {
      establishmentUid: req.params.establishmentUid,
      notificationTypeUid: typeData[0].Id,
      notificationContentUid: null,
      userUid: req.body.userUid,
    };
    console.log(req.userUid);
    await notifications.insertNewNotification(params);
    return res.status(200);
  } catch (e) {
    return res.status(500).send({
      message: e.message,
    });
  }
};

router.route('/type').get(getNotificationTypes);
router.route('/type').post(createNotificationType);
router.route('/establishment/:establishmentUid').get(getEstablishmentNotifications);
router.route('/establishment/:establishmentUid').post(sendEstablishmentNotification);
router.route('/:notificationUid').patch(Authorization.isAuthorised, setNotificationRead);
router.route('/:notificationUid').get(getNotification);
router.use('/', Authorization.isAuthorised);
module.exports = router;

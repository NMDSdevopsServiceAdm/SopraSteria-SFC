// default route for user endpoint
const { RewriteFrames } = require('@sentry/integrations');
const express = require('express');
const router = express.Router();

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
    if (req.params === null)
    {
        return res.status(400).send({message: 'No new type was provided'});
    }

    await notifications.createNotificationType(req.body);

    const newType = notifications.selectNotificationTypeByTypeName(req.body.type);
    return res.status(200).send(newType);
  }
  catch (e) {
    return res.status(500).send({
        message: e.message
    });
  }
}

const getEstablishmentNotifications = async (req, res) => {
    const establishmentNotifications = await notifications.selectNotificationByEstablishment(req.params.establishmentUid);
    return res.status(200).send(establishmentNotifications);
}

const sendEstablishmentNotification = async (req, res) => {
    try {
        const typeData = await notifications.selectNotificationTypeByTypeName(req.body.type);
        const params = {
            targetUid: req.params.establishmentUid,
            type: req.body.type,
            notificationTypeUid: typeData[0].Id,
            isEstablishmentLevel: true,
            userUid: req.userUid,
        }
        console.log(req.userUid);
        await notifications.insertNewNotification(params);
        return res.status(200);
    } catch (e) {
        return res.status(500).send({
            message: e.message
        });
    }
}

router.route('/type').get(getNotificationTypes);
router.route('/type').post(createNotificationType);
router.route('/establishment/:establishmentUid').get(getEstablishmentNotifications);
router.route('/establishment/:establishmentUid').post(sendEstablishmentNotification);
module.exports = router;

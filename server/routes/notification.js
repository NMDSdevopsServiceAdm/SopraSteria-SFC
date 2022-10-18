// default route for user endpoint
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

router.route('/type').get(getNotificationTypes);
module.exports = router;

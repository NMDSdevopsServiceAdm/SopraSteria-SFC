'use strict';

const db = require('../utils/datastore');

const getListQuery = `
  SELECT
    "notificationUid",
    type,
    created,
    "isViewed",
    "createdByUserUID"
  FROM cqc."Notifications"
  WHERE cqc."Notifications"."recipientUserUid" = :recipientUserUid
  LIMIT :limit
  OFFSET :offset;
  `;

const selectEstablishmentNotifications = `
  SELECT
    "notificationUid",
    "type",
    "created",
    "isViewed",
    "createdByUserUID"
  FROM cqc."NotificationsEstablishment"
  WHERE "establishmentUid" = :establishmentUid
  LIMIT :limit
  OFFSET :offset;
  `;

exports.getListByUser = async ({ userUid, limit, offset }) =>
  db.query(getListQuery, {
    replacements: {
      recipientUserUid: userUid,
      limit: Number.isInteger(limit) && limit > 0 ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0,
    },
    type: db.QueryTypes.SELECT,
  });

const selectOneUserNotification = `
  SELECT
    "notificationUid",
    "type",
    "typeUid" AS "notificationContentUid",
    "created",
    "isViewed",
    "createdByUserUID"
  FROM cqc."Notifications"
  WHERE cqc."Notifications"."notificationUid" = :notificationUid
  LIMIT :limit;
`;

const selectOneEstablishmentNotification = `
  SELECT
    "notificationUid",
    "type",
    "notificationContentUid",
    "ne"."created",
    "isViewed",
    "createdByUserUID"
  FROM cqc."NotificationsEstablishment"
  WHERE "notificationUid" = :notificationUid
  LIMIT :limit
`;

exports.selectOneUserNotification = async ({ notificationUid }) =>
  db.query(selectOneUserNotification, {
    replacements: {
      notificationUid: notificationUid,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

exports.selectOneEstablishmentNotification = async ({ notificationUid }) =>
  db.query(selectOneEstablishmentNotification, {
    replacements: {
      notificationUid: notificationUid,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

const markUserNotificationReadQuery = `
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "notificationUid" = :notificationUid;
`;

const markEstablishmentNotificationReadQuery = `
  UPDATE cqc."NotificationsEstablishment"
  SET "isViewed" = :isViewed
  WHERE "notificationUid" = :notificationUid
`;

const insertUserNotificationQuery = `
INSERT INTO
cqc."Notifications"
("type", "recipientUserUid", "isViewed", "createdByUserUID")
VALUES (:type, :recipientUserUid, :isViewed, :createdByUserUID);
`;

const insertEstablishmentNotificationQuery = `
INSERT INTO
cqc."NotificationsEstablishment"
("notificationContentUid", "establishmentUid", "isViewed", "createdByUserUID")
VALUES (:notificationContentUid, :establishmentUid, :isViewed, :createdByUserUID);
`;

const updateNotificationQuery = `
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :nuid
  AND "Notifications"."userUid" = :recipientUserUid;
`;

//TODO: Change table name to NotificationType
const selectNotificationTypeQuery = `
  SELECT "id", "type", "title"
  FROM cqc."NotificationType";
`;

const createNotificationType = `
  INSERT INTO
  cqc."NotificationType" ("type", "title")
  VALUES (:type, :title);
`;

exports.createNotificationType = async (params) =>
  db.query(createNotificationType, {
    replacements: {
      type: params.type,
      title: params.title,
    },
    type: db.QueryTypes.INSERT,
  });

exports.selectNotificationByEstablishment = async (establishmentUid, limit, offset) =>
  db.query(selectEstablishmentNotifications, {
    replacements: {
      establishmentUid: establishmentUid,
      limit: Number.isInteger(limit) && limit > 0 ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0,
    },
    type: db.QueryTypes.SELECT,
  });

exports.getNotificationTypes = async () =>
  db.query(selectNotificationTypeQuery, { replacements: {}, type: db.QueryTypes.SELECT });

exports.markUserNotificationAsRead = async ({ notificationUid }) =>
  db.query(markUserNotificationReadQuery, {
    replacements: {
      notificationUid,
      isViewed: true,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.markEstablishmentNotificationAsRead = async ({ notificationUid }) =>
  db.query(markEstablishmentNotificationReadQuery, {
    replacements: {
      notificationUid: notificationUid,
      isViewed: true,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.insertNewUserNotification = async (params) =>
  db.query(insertUserNotificationQuery, {
    replacements: {
      type: params.type,
      typeUid: params.notificationContentUid,
      recipientUserUid: params.recipientUserUid,
      isViewed: false,
      createdByUserUID: params.senderUid,
    },
    type: db.QueryTypes.INSERT,
  });

exports.insertNewEstablishmentNotification = async (params) => {
  console.log(params);
  db.query(insertEstablishmentNotificationQuery, {
    replacements: {
      notificationContentUid: params.notificationContentUid,
      establishmentUid: params.establishmentUid,
      isViewed: false,
      createdByUserUID: params.userUid,
      Type: params.type,
    },
    type: db.QueryTypes.INSERT,
  });
};
exports.updateNotification = async (params) =>
  db.query(updateNotificationQuery, {
    replacements: {
      nuid: params.exsistingNotificationUid,
      type: 'OWNERSHIPCHANGE',
      typUid: params.ownerRequestChangeUid,
      recipientUserUid: params.userUid,
      isViewed: false,
    },
    type: db.QueryTypes.UPDATE,
  });

const getRequesterNameQuery = `
    select "NameValue" from cqc."User" as individual
    JOIN cqc."Establishment" as est on est."EstablishmentID" = individual."EstablishmentID"
    WHERE "UserUID" = :recipientUserUid;
    `;

exports.getRequesterName = async (userUID) =>
  db.query(getRequesterNameQuery, {
    replacements: {
      recipientUserUid: userUID,
    },
    type: db.QueryTypes.SELECT,
  });

const getDeLinkParentDetailsQuery = `
  select "EstablishmentID" from cqc."User" as individual
  JOIN cqc."Notifications" as est on est."userUid" = individual."UserUID"
  WHERE "typeUid" = :typeUid
    `;

exports.getDeLinkParentDetails = async (typeUid) =>
  db.query(getDeLinkParentDetailsQuery, {
    replacements: {
      typeUid: typeUid,
    },
    type: db.QueryTypes.SELECT,
  });

const getDeLinkParentNameQuery = `
  select "NameValue" from cqc."Establishment"
  WHERE "EstablishmentID" = :estID;
    `;

exports.getDeLinkParentName = async (estID) =>
  db.query(getDeLinkParentNameQuery, {
    replacements: {
      estID: estID,
    },
    type: db.QueryTypes.SELECT,
  });

const getEstablishmentIdQuery = `
  select "EstablishmentID" from cqc."Establishment"
  WHERE "NmdsID" = :nmsdId;
  `;

exports.getEstablishmentId = async (params) =>
  db.query(getEstablishmentIdQuery, {
    replacements: {
      nmsdId: params.nmsdId,
    },
    type: db.QueryTypes.SELECT,
  });

const getAllUserQuery = `
  select "UserUID" from cqc."User"
  WHERE "EstablishmentID" = :establishmentId;
  `;

exports.getAllUser = async (params) =>
  db.query(getAllUserQuery, {
    replacements: {
      establishmentId: params.establishmentId,
    },
    type: db.QueryTypes.SELECT,
  });

const deleteNotificationsQuery = `
  DELETE FROM cqc."NotificationsEstablishment"
  WHERE "notificationUid" = :notificationUid
`;

exports.deleteNotifications = async (notificationUid) =>
  db.query(deleteNotificationsQuery, {
    replacements: { notificationUid },
    type: db.QueryTypes.DELETE,
  });

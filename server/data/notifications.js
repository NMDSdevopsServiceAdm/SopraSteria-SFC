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

const selectEstablishmentNotifications = (order) => `
(SELECT "notificationUid", type, "recipientUserUid", created, "isViewed", "createdByUserUID"
	FROM cqc."Notifications"
    WHERE "recipientUserUid" IN (:userUids)
UNION
SELECT "notificationUid", type, "establishmentUid", created, "isViewed", "createdByUserUID"
    FROM cqc."NotificationsEstablishment"
    WHERE "establishmentUid" = :establishmentUid)
  ORDER BY ${order}
  LIMIT :limit
  OFFSET :offset;
  `;

const getEstablishmentNotificationCount = `
SELECT COUNT ("notificationUid") FROM (SELECT "notificationUid"
	FROM cqc."Notifications"
    WHERE "recipientUserUid" IN (:userUids)
UNION
SELECT "notificationUid"
    FROM cqc."NotificationsEstablishment"
    WHERE "establishmentUid" = :establishmentUid) as notificationCount;
    `;

const selectEstablishmentNotificationsNoUsers = (order) => `
  SELECT "notificationUid", type, "establishmentUid", created, "isViewed", "createdByUserUID"
      FROM cqc."NotificationsEstablishment"
      WHERE "establishmentUid" = :establishmentUid
    ORDER BY ${order}
    LIMIT :limit
    OFFSET :offset;
  `;

const getEstablishmentNotificationNoUsersCount = `
SELECT COUNT("notificationUid")
  FROM cqc."NotificationsEstablishment"
  WHERE "establishmentUid" = :establishmentUid;
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
    "created",
    "isViewed",
    "createdByUserUID",
    "requestorEstUID"
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
("type", "typeUid", "recipientUserUid", "isViewed", "createdByUserUID")
VALUES (:type, :typeUid, :recipientUserUid, :isViewed, :createdByUserUID);
`;

const insertEstablishmentNotificationQuery = `
INSERT INTO
cqc."NotificationsEstablishment"
("notificationContentUid", "type", "establishmentUid", "isViewed", "createdByUserUID", "requestorEstUID")
VALUES (:notificationContentUid, :type, :establishmentUid, :isViewed, :createdByUserUID, :requestorEstUID);
`;

const updateNotificationQuery = `
  UPDATE cqc."NotificationsEstablishment"
  SET "isViewed" = :isViewed
  WHERE "notificationUid" = :nuid
`;

exports.selectNotificationByEstablishment = async (params) => {
  const order = params.order ? params.order : 'created ASC';

  let count;
  let notifications;

  if (params.userUids.length > 0) {
    notifications = await db.query(selectEstablishmentNotifications(order), {
      replacements: {
        establishmentUid: params.establishmentUid,
        userUids: params.userUids,
        limit: Number.isInteger(params.limit) && params.limit > 0 ? params.limit : null,
        offset: Number.isInteger(params.offset) && params.offset > 0 ? params.offset : 0,
      },
      type: db.QueryTypes.SELECT,
    });

    count = await db.query(getEstablishmentNotificationCount, {
      replacements: {
        establishmentUid: params.establishmentUid,
        userUids: params.userUids,
      },
      type: db.QueryTypes.SELECT,
    });
  } else {
    notifications = await db.query(selectEstablishmentNotificationsNoUsers(order), {
      replacements: {
        establishmentUid: params.establishmentUid,
        limit: Number.isInteger(params.limit) && params.limit > 0 ? params.limit : null,
        offset: Number.isInteger(params.offset) && params.offset > 0 ? params.offset : 0,
      },
      type: db.QueryTypes.SELECT,
    });

    count = await db.query(getEstablishmentNotificationNoUsersCount, {
      replacements: {
        establishmentUid: params.establishmentUid,
      },
      type: db.QueryTypes.SELECT,
    });
  }

  return {
    notifications: notifications,
    count: count[0].count,
  };
};

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
  db.query(insertEstablishmentNotificationQuery, {
    replacements: {
      notificationContentUid: params.notificationContentUid,
      establishmentUid: params.establishmentUid,
      isViewed: false,
      createdByUserUID: params.userUid,
      type: params.type,
      requestorEstUID: params.requestorEstId || null,
    },
    type: db.QueryTypes.INSERT,
  });
};

exports.updateNotification = async (params) =>
  db.query(updateNotificationQuery, {
    replacements: {
      nuid: params.existingNotificationUid,
      type: 'OWNERCHANGE',
      typUid: params.ownerRequestChangeUid,
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

const getRequestorEstablishmentQuery = `
    SELECT "NameValue" from cqc."Establishment" WHERE "EstablishmentUID" = :establishmentUid`;

exports.getRequestorEstablishment = async (estUID) =>
  db.query(getRequestorEstablishmentQuery, {
    replacements: {
      establishmentUid: estUID,
    },
    type: db.QueryTypes.SELECT,
  });

const getDeLinkParentDetailsQuery = `
select "establishmentUid"
FROM cqc."NotificationsEstablishment"
WHERE "notificationContentUid" = :typeUid
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
  WHERE "EstablishmentUID" = :estID;
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
SELECT "UserUID" from cqc."User" u
JOIN cqc."Establishment" e ON e."EstablishmentID" = u."EstablishmentID"
WHERE e."EstablishmentUID" = :establishmentUid;
  `;

exports.getAllUsers = async (establishmentUid) =>
  db.query(getAllUserQuery, {
    replacements: {
      establishmentUid: establishmentUid,
    },
    type: db.QueryTypes.SELECT,
  });

const deleteNotificationsEstablishmentQuery = `
  DELETE FROM cqc."NotificationsEstablishment"
  WHERE "notificationUid" = :notificationUid
`;

const deleteNotificationsQuery = `
  DELETE FROM cqc."Notifications"
  WHERE "notificationUid" = :notificationUid
`;

exports.deleteNotifications = async (notificationUid) => {
  db.query(deleteNotificationsEstablishmentQuery, {
    replacements: { notificationUid },
    type: db.QueryTypes.DELETE,
  });

  db.query(deleteNotificationsQuery, {
    replacements: { notificationUid },
    type: db.QueryTypes.DELETE,
  });
};

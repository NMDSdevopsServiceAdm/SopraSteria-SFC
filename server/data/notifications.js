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
  WHERE cqc."Notifications"."targetUid" = :targetUid
  AND cqc."Notifications"."isEstablishmentLevel" = :isEstablishmentLevel
  LIMIT :limit
  OFFSET :offset;
  `;

exports.getListByUser = async ({ userUid, limit, offset }) =>
  db.query(getListQuery, {
    replacements: {
      targetUid: userUid,
      isEstablishmentLevel: false,
      limit: Number.isInteger(limit) && limit > 0 ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0,
    },
    type: db.QueryTypes.SELECT,
  });

const getOneQuery = `
  SELECT
    "notificationUid",
    type,
    "typeUid",
    created,
    "isViewed",
    "createdByUserUID"
  FROM cqc."Notifications"
  WHERE cqc."Notifications"."notificationUid" = :notificationUid
  AND cqc."Notifications"."targetUid" = :userUid
  LIMIT :limit;
`;

exports.getOne = async ({ userUid, notificationUid }) =>
  db.query(getOneQuery, {
    replacements: {
      userUid,
      notificationUid,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

const markOneAsReadQuery = `
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :notificationUid
  AND "Notifications"."targetUid" = :userUid;
`;

const insertNotificationQuery = `
INSERT INTO
cqc."Notifications"
("type", "typeUid", "targetUid", "isViewed", "createdByUserUID")
VALUES (:type, :typUid, :targetUid, :isViewed, :createdByUserUID);
`;
const updateNotificationQuery = `
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :nuid
  AND "Notifications"."targetUid" = :targetUid;
`;

//TODO: Change table name to NotificationType
const selectNotificationTypeQuery = `
  SELECT "Id", "Type", "Title"
  FROM cqc."NotificationType";
`;

const createNotificationType = `
  INSERT INTO
  cqc."NotificationType" ("Type", "Title")
  VALUES (:type, :title);
`

const selectNotificationTypeByTypeName = `
SELECT "Id", "Type", "Title"
FROM cqc."NotificationType"
WHERE "NotificationType"."Type" = :type;
`;

exports.createNotificationType = async (params) =>
  db.query(createNotificationType, {replacements: {
    type: params.type,
    title: params.title
  },
  type: db.QueryTypes.INSERT,
});

exports.selectNotificationTypeByTypeName = async (typeName) =>
  db.query(selectNotificationTypeByTypeName,
    {replacements: {type: typeName},
    type: db.QueryTypes.SELECT
  });


exports.selectNotificationByEstablishment = async (establishmentUid, limit, offset) =>
  db.query(getListQuery, {
    replacements: {
      targetUid: establishmentUid,
      isEstablishmentLevel: true,
      limit: Number.isInteger(limit) && limit > 0 ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0,
    },
   type: db.QueryTypes.SELECT,
  });

exports.getNotificationTypes = async () =>
  db.query(selectNotificationTypeQuery, { replacements: {}, type: db.QueryTypes.SELECT });

exports.markOneAsRead = async ({ userUid, notificationUid }) =>
  db.query(markOneAsReadQuery, {
    replacements: {
      userUid,
      notificationUid,
      isViewed: true,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.insertNewNotification = async (params) =>
  db.query(insertNotificationQuery, {
    replacements: {
      type: params.type,
      typUid: params.typeUid,
      targetUid: params.targetUid,
      isViewed: false,
      createdByUserUID: params.userUid,
      isEstablishmentLevel: params.isEstablishmentLevel
    },
    type: db.QueryTypes.INSERT,
  });


exports.updateNotification = async (params) =>
  db.query(updateNotificationQuery, {
    replacements: {
      nuid: params.exsistingNotificationUid,
      type: 'OWNERSHIPCHANGE',
      typUid: params.ownerRequestChangeUid,
      targetUid: params.targetUid,
      isViewed: false,
    },
    type: db.QueryTypes.UPDATE,
  });

const getRequesterNameQuery = `
    select "NameValue" from cqc."User" as individual
    JOIN cqc."Establishment" as est on est."EstablishmentID" = individual."EstablishmentID"
    WHERE "UserUID" = :userUid;
    `;

exports.getRequesterName = async (userUID) =>
  db.query(getRequesterNameQuery, {
    replacements: {
      userUid: userUID,
    },
    type: db.QueryTypes.SELECT,
  });

const getDeLinkParentDetailsQuery = `
  select "EstablishmentID" from cqc."User" as individual
  JOIN cqc."Notifications" as est on est."targetUid" = individual."UserUID"
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

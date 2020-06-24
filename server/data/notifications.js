'use strict';

const rfr = require('rfr');

const db = rfr('server/utils/datastore');

const getListQuery =
`
  SELECT
    "notificationUid",
    type,
    created,
    "isViewed",
    "createdByUserUID"
  FROM cqc."Notifications"
  WHERE cqc."Notifications"."recipientUserUid" = :userUid
  LIMIT :limit
  OFFSET :offset;
`;

exports.getListByUser = async ({ userUid, limit, offset }) =>
  db.query(getListQuery, {
    replacements: {
      userUid,
      limit: Number.isInteger(limit) && limit > 0 ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0
    },
    type: db.QueryTypes.SELECT
  });

const getOneQuery =
`
  SELECT
    "notificationUid",
    type,
    "typeUid",
    created,
    "isViewed",
    "createdByUserUID"
  FROM cqc."Notifications"
  WHERE cqc."Notifications"."notificationUid" = :notificationUid
  AND cqc."Notifications"."recipientUserUid" = :userUid
  LIMIT :limit;
`;

exports.getOne = async ({ userUid, notificationUid }) =>
  db.query(getOneQuery, {
    replacements: {
      userUid,
      notificationUid,
      limit: 1
    },
    type: db.QueryTypes.SELECT
  });

const markOneAsReadQuery =
`
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :notificationUid
  AND "Notifications"."recipientUserUid" = :userUid;
`;

const insertNotificationQuery =
`
INSERT INTO
cqc."Notifications"
("notificationUid", "type", "typeUid", "recipientUserUid", "isViewed", "createdByUserUID")
VALUES (:nuid, :type, :typUid, :recipientUserUid, :isViewed, :createdByUserUID);
`;
const updateNotificationQuery =
`
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :nuid
  AND "Notifications"."recipientUserUid" = :recipientUserUid;
`;
exports.markOneAsRead = async ({ userUid, notificationUid }) =>
  db.query(markOneAsReadQuery, {
    replacements: {
      userUid,
      notificationUid,
      isViewed: true
    },
    type: db.QueryTypes.UPDATE
  });

  exports.insertNewNotification = async (params) =>
    db.query(insertNotificationQuery, {
        replacements: {
            nuid: params.notificationUid,
            type: params.type,
            typUid: params.ownerRequestChangeUid ? params.ownerRequestChangeUid : params.typeUid,
            recipientUserUid: params.recipientUserUid,
            isViewed: false,
            createdByUserUID: params.userUid
        },
        type: db.QueryTypes.INSERT
    });
    exports.updateNotification = async (params) =>
    db.query(updateNotificationQuery, {
        replacements: {
            nuid: params.exsistingNotificationUid,
            type: 'OWNERSHIPCHANGE',
            typUid: params.ownerRequestChangeUid,
            recipientUserUid: params.recipientUserUid,
            isViewed: false
        },
        type: db.QueryTypes.UPDATE
    });

    const getRequesterNameQuery = `
    select "NameValue" from cqc."User" as individual
    JOIN cqc."Establishment" as est on est."EstablishmentID" = individual."EstablishmentID"
    WHERE "UserUID" = :userUid;
    `;

  exports.getRequesterName = async userUID =>
    db.query(getRequesterNameQuery, {
      replacements: {
        userUid: userUID,
      },
      type: db.QueryTypes.SELECT,
  });

  const getDeLinkParentDetailsQuery = `
  select "EstablishmentID" from cqc."User" as individual
  JOIN cqc."Notifications" as est on est."recipientUserUid" = individual."UserUID"
  WHERE "typeUid" = :typeUid
    `;

  exports.getDeLinkParentDetails = async typeUid =>
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

  exports.getDeLinkParentName = async estID =>
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

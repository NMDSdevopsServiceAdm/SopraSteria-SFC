'use strict';

const db = rfr('server/utils/datastore');

const getListQuery =
`
  SELECT
    "notificationUid",
    type,
    created,
    "isViewed"
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
    "isViewed"
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
("notificationUid", "type", "typeUid", "recipientUserUid", "isViewed")
VALUES (:nuid, :type, :typUid, :recipientUserUid, :isViewed);
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
            typUid: params.ownerRequestChangeUid,
            recipientUserUid: params.recipientUserUid,
            isViewed: false
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
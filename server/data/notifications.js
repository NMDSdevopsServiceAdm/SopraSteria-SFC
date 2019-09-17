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

exports.markOneAsRead = async ({ userUid, notificationUid }) =>
  db.query(markOneAsReadQuery, {
    replacements: {
      userUid,
      notificationUid,
      isViewed: true
    },
    type: db.QueryTypes.UPDATE
  });

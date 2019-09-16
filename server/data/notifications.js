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
      limit: Number.isInteger(limit) ? limit : null,
      offset: Number.isInteger(offset) && offset > 0 ? offset : 0
    },
    type: db.QueryTypes.SELECT
  });


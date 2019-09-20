'use strict';

const db = rfr('server/utils/datastore');

const checkEstablishmentQuery =
`
SELECT a."EstablishmentID", a."UserUID", b."IsParent", b."ParentID"
FROM cqc."User" a JOIN cqc."Establishment" b ON a."EstablishmentID" = b."EstablishmentID"
WHERE a."IsPrimary" = true and b."IsParent" = false AND b."ParentID" IS NOT NULL
AND a."EstablishmentID" = :subEstId;
`;

const insertChangeOwnershipQuery =
`
INSERT INTO
cqc."OwnerChangeRequest"
("ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "createdByUserUID")
VALUES (:uid, :subEstId, :permReq, :appStatus, :userUid);
`;

const lastOwnerChangeRequestQuery =
`
SELECT "ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "approvalReason", created, "createdByUserUID", updated, "updatedByUserUID"
FROM cqc."OwnerChangeRequest"
WHERE cqc."OwnerChangeRequest"."subEstablishmentID" = :subEstId
ORDER BY cqc."OwnerChangeRequest"."created" DESC
LIMIT :limit;
`;


const insertNotificationQuery =
`
INSERT INTO
cqc."Notifications"
("notificationUid", "type", "typeUid", "recipientUserUid", "isViewed")
VALUES (:nuid, :type, :typUid, :recipientUserUid, :isViewed);
`;

exports.checkEstablishment = async(params) =>
    db.query(checkEstablishmentQuery, {
        replacements: {
            subEstId: params.subEstablishmentId
        },
        type: db.QueryTypes.SELECT
    })

exports.changeOwnershipRequest = async (params) =>
    db.query(insertChangeOwnershipQuery, {
        replacements: {
            uid: params.ownerRequestChangeUid,
            subEstId: params.subEstablishmentId,
            permReq: params.permissionRequest,
            appStatus: "REQUESTED",
            userUid: params.userUid
          },
          type: db.QueryTypes.INSERT
    })

exports.insertNewNotification = async (params) =>
    db.query(insertNotificationQuery, {
        replacements: {
            nuid: params.notificationUid,
            type: "OWNERCHANGE",
            typUid: params.ownerRequestChangeUid,
            recipientUserUid: params.recipientUserUid,
            isViewed: false
        },
        type: db.QueryTypes.INSERT
    })

exports.lastOwnershipRequest = async (params) =>
    db.query(lastOwnerChangeRequestQuery, {
        replacements: {
            subEstId: params.subEstablishmentId,
            limit: 1
        },
        type: db.QueryTypes.SELECT
      });
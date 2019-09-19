'use strict';

const db = rfr('server/utils/datastore');

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
`

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

exports.lastOwnershipRequest = async (params) =>
    db.query(lastOwnerChangeRequestQuery, {
        replacements: {
            subEstId: params.subEstablishmentId,
            limit: 1
        },
        type: db.QueryTypes.SELECT
      });
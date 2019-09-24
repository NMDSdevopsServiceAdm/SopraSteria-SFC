'use strict';

const db = rfr('server/utils/datastore');

const getEstablishmentDetailsQuery =
`
SELECT "EstablishmentID"
FROM cqc."Establishment"
WHERE "EstablishmentID" = :subEstId;
`;

const checkEstablishmentQuery =
`
SELECT "EstablishmentID", "IsParent", "ParentID" FROM cqc."Establishment"
WHERE "IsParent" = false AND "ParentID" IS NOT NULL AND "Archived" = false
AND "EstablishmentID" = :subEstId;
`;

const checkAlreadyRequestedOwnershipQuery =
`
SELECT "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "subEstablishmentID" = :subEstId
AND "approvalStatus" = :status;
`

const insertChangeOwnershipQuery =
`
INSERT INTO
cqc."OwnerChangeRequest"
("ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "createdByUserUID")
VALUES (:uid, :subEstId, :permReq, :appStatus, :userUid);
`;

const lastOwnerChangeRequestQuery =
`
SELECT "ownerChangeRequestUID", "permissionRequest", "approvalStatus", created, "createdByUserUID"
FROM cqc."OwnerChangeRequest"
WHERE cqc."OwnerChangeRequest"."subEstablishmentID" = :subEstId
ORDER BY cqc."OwnerChangeRequest"."created" DESC
LIMIT :limit;
`;

exports.getEstablishmentDetails = async(params) =>
  db.query(getEstablishmentDetailsQuery, {
    replacements: {
        subEstId: params.subEstablishmentId
    },
    type: db.QueryTypes.SELECT
  })

exports.checkEstablishment = async(params) =>
    db.query(checkEstablishmentQuery, {
        replacements: {
            subEstId: params.subEstablishmentId
        },
        type: db.QueryTypes.SELECT
    })

exports.checkAlreadyRequestedOwnership = async(params) =>
    db.query(checkAlreadyRequestedOwnershipQuery, {
        replacements: {
            subEstId: params.subEstablishmentId,
            status: 'REQUESTED'
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

exports.lastOwnershipRequest = async (params) =>
    db.query(lastOwnerChangeRequestQuery, {
        replacements: {
            subEstId: params.subEstablishmentId,
            limit: 1
        },
        type: db.QueryTypes.SELECT
      });

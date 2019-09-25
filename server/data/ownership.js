'use strict';

const db = rfr('server/utils/datastore');

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
("ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "createdByUserUID", "updatedByUserUID")
VALUES (:uid, :subEstId, :permReq, :appStatus, :userUid, :userUid);
`;

const lastOwnerChangeRequestQuery =
`
SELECT "ownerChangeRequestUID", "permissionRequest", "approvalStatus", created, "createdByUserUID"
FROM cqc."OwnerChangeRequest"
WHERE cqc."OwnerChangeRequest"."subEstablishmentID" = :subEstId
ORDER BY cqc."OwnerChangeRequest"."created" DESC
LIMIT :limit;
`;

const getReipientUserDetailsQuery =
`
select "UserUID" from cqc."Establishment" a JOIN
cqc."User" b ON a."EstablishmentID" = b."EstablishmentID"  where a."EstablishmentID" = :estID AND b."IsPrimary" = true;
`;

exports.getReipientUserDetails = async(params) =>
  db.query(getReipientUserDetailsQuery, {
    replacements: {
      estID: params.parentId
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

'use strict';

const db = rfr('server/utils/datastore');

const checkAlreadyRequestedOwnershipQuery =
`
SELECT "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "subEstablishmentID" = :subEstId
AND "approvalStatus" = :status;
`;

const checkAlreadyRequestedOwnershipWithUIDQuery =
`
SELECT "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "approvalStatus" = :status AND "ownerChangeRequestUID" = :id;
`;

const insertChangeOwnershipQuery =
`
INSERT INTO
cqc."OwnerChangeRequest"
("ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "createdByUserUID", "updatedByUserUID")
VALUES (:uid, :subEstId, :permReq, :appStatus, :userUid, :userUid);
`;

const updateChangeOwnershipQuery =
`
UPDATE cqc."OwnerChangeRequest"
SET "approvalStatus" = :approvalStatus, "approvalReason" = :approvalReason, "updatedByUserUID" = :userUid
WHERE "ownerChangeRequestUID" = :uid;
`;

const cancelOwnershipRequestQuery =
`
UPDATE cqc."OwnerChangeRequest"
SET "approvalStatus" = :approvalStatus
WHERE "ownerChangeRequestUID" = :uid;
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

const ownershipDetailsQuery =
`
SELECT "ownerChangeRequestUID", "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "subEstablishmentID" = :subEstId ORDER BY "created" DESC LIMIT :limit;
`;

const getUpdatedOwnershipRequestQuery =
`
SELECT "ownerChangeRequestUID", "approvalStatus", "permissionRequest", "createdByUserUID", "created", "updatedByUserUID", "updated"
FROM cqc."OwnerChangeRequest"
WHERE "ownerChangeRequestUID" = :ownerChangeId;
`;

const changedDataOwnershipRequestedQuery =
`
UPDATE cqc."Establishment"
SET "DataOwnershipRequested" = :timestamp
WHERE "EstablishmentID" = :estId;
`

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

exports.checkAlreadyRequestedOwnershipWithUID = async(params) =>
    db.query(checkAlreadyRequestedOwnershipWithUIDQuery, {
        replacements: {
            status: 'REQUESTED',
            id: params.ownerRequestChangeUid
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

exports.ownershipDetails = async(params) =>
  db.query(ownershipDetailsQuery, {
      replacements: {
          subEstId: params.subEstablishmentId,
          limit: 1
      },
      type: db.QueryTypes.SELECT
  })

exports.getUpdatedOwnershipRequest = async(params) =>
  db.query(getUpdatedOwnershipRequestQuery, {
      replacements: {
        ownerChangeId: params.ownerRequestChangeUid
      },
      type: db.QueryTypes.SELECT
  })

exports.updateOwnershipRequest = async (params) =>
  db.query(updateChangeOwnershipQuery, {
      replacements: {
          uid: params.ownerRequestChangeUid,
          approvalReason: params.approvalReason,
          approvalStatus: params.approvalStatus,
          userUid: params.userUid
        },
        type: db.QueryTypes.UPDATE
  })

exports.cancelOwnershipRequest = async (params) =>
  db.query(cancelOwnershipRequestQuery, {
      replacements: {
          uid: params.ownerRequestChangeUid,
          approvalStatus: params.approvalStatus
        },
        type: db.QueryTypes.UPDATE
  })

exports.changedDataOwnershipRequested = async (params) =>
  db.query(changedDataOwnershipRequestedQuery, {
      replacements: {
          estId: params.subEstablishmentId,
          timestamp: params.timeValue
        },
        type: db.QueryTypes.UPDATE
  })


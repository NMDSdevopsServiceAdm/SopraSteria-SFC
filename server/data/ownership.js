'use strict';

const db = rfr('server/utils/datastore');

const checkAlreadyRequestedOwnershipQuery = `
SELECT "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "subEstablishmentID" = :subEstId
AND "approvalStatus" = :status;
`;

const checkAlreadyRequestedOwnershipWithUIDQuery = `
SELECT "subEstablishmentID", "approvalStatus"
FROM cqc."OwnerChangeRequest"
WHERE "approvalStatus" = :status AND "ownerChangeRequestUID" = :id;
`;

const insertChangeOwnershipQuery = `
INSERT INTO
cqc."OwnerChangeRequest"
("ownerChangeRequestUID", "subEstablishmentID", "permissionRequest", "approvalStatus", "createdByUserUID", "updatedByUserUID")
VALUES (:uid, :subEstId, :permReq, :appStatus, :userUid, :userUid);
`;

const updateChangeOwnershipQuery = `
UPDATE cqc."OwnerChangeRequest"
SET "approvalStatus" = :approvalStatus, "approvalReason" = :rejectionReason, "updatedByUserUID" = :userUid
WHERE "ownerChangeRequestUID" = :uid;
`;

const cancelOwnershipRequestQuery = `
UPDATE cqc."OwnerChangeRequest"
SET "approvalStatus" = :approvalStatus
WHERE "ownerChangeRequestUID" = :uid;
`;

const lastOwnerChangeRequestQuery = `
SELECT "ownerChangeRequestUID", "permissionRequest", "approvalStatus", created, "createdByUserUID"
FROM cqc."OwnerChangeRequest"
WHERE cqc."OwnerChangeRequest"."subEstablishmentID" = :subEstId
ORDER BY cqc."OwnerChangeRequest"."created" DESC
LIMIT :limit;
`;

const getRecipientUserDetailsQuery = `
select "UserUID" from cqc."Establishment" est
LEFT JOIN cqc."Establishment" parent ON parent."EstablishmentID" = est."ParentID"
JOIN cqc."User" individual ON individual."EstablishmentID" = COALESCE(parent."EstablishmentID", est."EstablishmentID")
WHERE :estID = est."EstablishmentID" AND individual."UserRoleValue" = :userRole
`;
const getRecipientSubUserDetailsQuery = `select "UserUID" from cqc."Establishment" est
JOIN cqc."User" individual ON individual."EstablishmentID" = est."EstablishmentID"
WHERE est."EstablishmentID"= :estID AND individual."UserRoleValue" = :userRole`;

const ownershipDetailsQuery = `
SELECT "ownerChangeRequestUID", "subEstablishmentID", "approvalStatus", "createdByUserUID"
FROM cqc."OwnerChangeRequest"
WHERE "subEstablishmentID" = :subEstId ORDER BY "created" DESC LIMIT :limit;
`;
const checkOwnershipRequestIdQuery = `
SELECT "ownerChangeRequestUID", "subEstablishmentID", "approvalStatus", "permissionRequest"
FROM cqc."OwnerChangeRequest"
WHERE "ownerChangeRequestUID" = :ownerChangeRequestUID ORDER BY "created" DESC LIMIT :limit;
`;

const getUpdatedOwnershipRequestQuery = `
SELECT "ownerChangeRequestUID", "approvalStatus", "permissionRequest", "approvalReason", "createdByUserUID", "created", "updatedByUserUID", "updated"
FROM cqc."OwnerChangeRequest"
WHERE "ownerChangeRequestUID" = :ownerChangeId;
`;

const changedDataOwnershipRequestedQuery = `
UPDATE cqc."Establishment"
SET "DataOwnershipRequested" = :timestamp
WHERE "EstablishmentID" = :estId;
`;

exports.getRecipientSubUserDetails = async params =>
  db.query(getRecipientSubUserDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
      userRole: 'Edit'
    },
    type: db.QueryTypes.SELECT,
  });
exports.getRecipientUserDetails = async params =>
  db.query(getRecipientUserDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
      userRole: 'Edit'
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkAlreadyRequestedOwnership = async params =>
  db.query(checkAlreadyRequestedOwnershipQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      status: 'REQUESTED',
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkAlreadyRequestedOwnershipWithUID = async params =>
  db.query(checkAlreadyRequestedOwnershipWithUIDQuery, {
    replacements: {
      status: 'REQUESTED',
      id: params.ownerRequestChangeUid,
    },
    type: db.QueryTypes.SELECT,
  });

exports.changeOwnershipRequest = async params =>
  db.query(insertChangeOwnershipQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      subEstId: params.subEstablishmentId,
      permReq: params.permissionRequest,
      appStatus: 'REQUESTED',
      userUid: params.userUid,
    },
    type: db.QueryTypes.INSERT,
  });

exports.lastOwnershipRequest = async params =>
  db.query(lastOwnerChangeRequestQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

exports.ownershipDetails = async params =>
  db.query(ownershipDetailsQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkOwnershipRquestId = async params =>
  db.query(checkOwnershipRequestIdQuery, {
    replacements: {
      ownerChangeRequestUID: params.ownerChangeRequestUID,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });
exports.getUpdatedOwnershipRequest = async params =>
  db.query(getUpdatedOwnershipRequestQuery, {
    replacements: {
      ownerChangeId: params.ownerRequestChangeUid,
    },
    type: db.QueryTypes.SELECT,
  });

exports.updateOwnershipRequest = async params =>
  db.query(updateChangeOwnershipQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      rejectionReason: params.rejectionReason,
      approvalStatus: params.approvalStatus,
      userUid: params.userUid,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.updateChangeRequest = async params =>
  db.query(updateChangeOwnershipQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      rejectionReason: params.rejectionReason,
      approvalStatus: params.approvalStatus,
      userUid: params.userUid,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.cancelOwnershipRequest = async params =>
  db.query(cancelOwnershipRequestQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      approvalStatus: params.approvalStatus,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.changedDataOwnershipRequested = async params =>
  db.query(changedDataOwnershipRequestedQuery, {
    replacements: {
      estId: params.subEstablishmentId,
      timestamp: params.timeValue,
    },
    type: db.QueryTypes.UPDATE,
  });

const getOwnershipNotificationDetailsQuery = `
SELECT
  "ownerChangeRequestUID",
  "createdByUserUID",
  parent."NameValue" as "parentEstablishmentName",
  sub."NameValue" as "subEstablishmentName",
  CASE
      WHEN sub."DataOwner" = :parent THEN :workplace
      WHEN sub."DataOwner" = :workplace THEN :parent
      ELSE :unknown
  END AS  "requestedOwnerType",
  "permissionRequest",
  "approvalStatus"
FROM cqc."OwnerChangeRequest" as owner
JOIN cqc."Establishment" as sub on sub."EstablishmentID" = owner."subEstablishmentID"
JOIN cqc."Establishment" as parent on sub."ParentID" =  parent."EstablishmentID"
WHERE "ownerChangeRequestUID" = :ownerChangeRequestUid;
`;

exports.getOwnershipNotificationDetails = async ({ ownerChangeRequestUid }) =>
  db.query(getOwnershipNotificationDetailsQuery, {
    replacements: {
      ownerChangeRequestUid,
      parent: 'Parent',
      workplace: 'Workplace',
      unknown: 'unknown',
    },
    type: db.QueryTypes.SELECT,
  });

const getNotificationRecieverNameQuery = `
  select "NameValue" from cqc."User" as use
  JOIN cqc."Notifications" as individual on individual."recipientUserUid" = use."UserUID"
  JOIN cqc."Establishment" as sub on sub."EstablishmentID" = use."EstablishmentID"
    WHERE "notificationUid" = :notificationUid;
  `;
exports.getNotificationRecieverName = async params =>
  db.query(getNotificationRecieverNameQuery, {
    replacements: {
      notificationUid: params.notificationUid,
    },
    type: db.QueryTypes.SELECT,
  });
 const getownershipRequesterIdQuery = `select "IsParent", "ParentID" from cqc."Establishment"
 WHERE "EstablishmentID" = :EstablishmentID;
 `;

 exports.getownershipRequesterId = async params =>
  db.query(getownershipRequesterIdQuery, {
    replacements: {
      EstablishmentID: params,
    },
    type: db.QueryTypes.SELECT,
  });
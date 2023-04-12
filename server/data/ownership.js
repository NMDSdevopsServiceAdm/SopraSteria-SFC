'use strict';

const db = require('../utils/datastore');

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

const getRecipientSubEstablishmentDetailsQuery = `
SELECT "EstablishmentUID" as "establishmentUid"
FROM cqc."Establishment"
WHERE "EstablishmentID" = :estID`;

const getRecipientEstablishmentDetailsQuery = `
SELECT parent."EstablishmentUID" as "establishmentUid"
FROM cqc."Establishment" est
LEFT JOIN cqc."Establishment" parent ON parent."EstablishmentID" = est."ParentID"
WHERE est."EstablishmentID" = :estID`;

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

const setOwnershipRequestedTimestampQuery = `
UPDATE cqc."Establishment"
SET "DataOwnershipRequested" = :timestamp
WHERE "EstablishmentID" = :estId;
`;

const getRequestorEstablishmentQuery = `
SELECT e."EstablishmentUID" as "establishmentUid"
FROM cqc."User" u
JOIN cqc."OwnerChangeRequest" ocr ON ocr."createdByUserUID" = u."UserUID"
JOIN cqc."Establishment" e ON e."EstablishmentID" = u."EstablishmentID"
WHERE ocr."ownerChangeRequestUID" = :ownershipRequestUid;
`;

exports.getRequestorEstablishment = async (ownershipRequestUid) =>
  db.query(getRequestorEstablishmentQuery, {
    replacements: {
      ownershipRequestUid: ownershipRequestUid,
    },
    type: db.QueryTypes.SELECT,
  });

exports.getRecipientSubUserDetails = async (params) =>
  db.query(getRecipientSubUserDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
      userRole: 'Edit',
    },
    type: db.QueryTypes.SELECT,
  });

exports.getRecipientUserDetails = async (params) =>
  db.query(getRecipientUserDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
      userRole: 'Edit',
    },
    type: db.QueryTypes.SELECT,
  });

exports.getRecipientEstablishmentDetails = async (params) =>
  db.query(getRecipientEstablishmentDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
    },
    type: db.QueryTypes.SELECT,
  });

exports.getRecipientSubEstablishmentDetails = async (params) =>
  db.query(getRecipientSubEstablishmentDetailsQuery, {
    replacements: {
      estID: params.establishmentId,
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkAlreadyRequestedOwnership = async (subEstablishmentId) =>
  db.query(checkAlreadyRequestedOwnershipQuery, {
    replacements: {
      subEstId: subEstablishmentId,
      status: 'REQUESTED',
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkAlreadyRequestedOwnershipWithUID = async (params) =>
  db.query(checkAlreadyRequestedOwnershipWithUIDQuery, {
    replacements: {
      status: 'REQUESTED',
      id: params.ownerRequestChangeUid,
    },
    type: db.QueryTypes.SELECT,
  });

exports.createChangeOwnershipRequest = async (params) =>
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

exports.lastOwnershipRequest = async (subEstablishmentId) =>
  db.query(lastOwnerChangeRequestQuery, {
    replacements: {
      subEstId: subEstablishmentId,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

exports.ownershipDetails = async (params) =>
  db.query(ownershipDetailsQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      limit: params.limit,
    },
    type: db.QueryTypes.SELECT,
  });

exports.checkOwnershipRequestId = async (params) =>
  db.query(checkOwnershipRequestIdQuery, {
    replacements: {
      ownerChangeRequestUID: params.ownerChangeRequestUID,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

exports.getUpdatedOwnershipRequest = async (params) =>
  db.query(getUpdatedOwnershipRequestQuery, {
    replacements: {
      ownerChangeId: params.ownerRequestChangeUid,
    },
    type: db.QueryTypes.SELECT,
  });

exports.updateChangeRequest = async (params) =>
  db.query(updateChangeOwnershipQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      rejectionReason: params.rejectionReason,
      approvalStatus: params.approvalStatus,
      userUid: params.userUid,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.cancelOwnershipRequest = async (params) =>
  db.query(cancelOwnershipRequestQuery, {
    replacements: {
      uid: params.ownerRequestChangeUid,
      approvalStatus: params.approvalStatus,
    },
    type: db.QueryTypes.UPDATE,
  });

exports.setOwnershipRequestedTimestamp = async (params) =>
  db.query(setOwnershipRequestedTimestampQuery, {
    replacements: {
      estId: params.establishmentId,
      timestamp: params.timeStamp,
    },
    type: db.QueryTypes.UPDATE,
  });

const getOwnershipNotificationDetailsQuery = `
SELECT
  "ownerChangeRequestUID",
  "createdByUserUID",
  parent."NameValue" as "parentEstablishmentName",
  parent."EstablishmentUID" as "parentEstablishmentUid",
  sub."NameValue" as "subEstablishmentName",
  sub."EstablishmentUID" as "subEstablishmentUid",
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
SELECT "NameValue" FROM cqc."Establishment" as est
JOIN cqc."NotificationsEstablishment" notification on notification."establishmentUid" = est."EstablishmentUID"
  WHERE "notificationUid" = :notificationUid;
  `;
exports.getNotificationRecieverName = async (params) =>
  db.query(getNotificationRecieverNameQuery, {
    replacements: {
      notificationUid: params.notificationUid,
    },
    type: db.QueryTypes.SELECT,
  });
const getownershipRequesterIdQuery = `select "IsParent", "ParentID" from cqc."Establishment"
 WHERE "EstablishmentID" = :EstablishmentID;
 `;

exports.getownershipRequesterId = async (params) =>
  db.query(getownershipRequesterIdQuery, {
    replacements: {
      EstablishmentID: params,
    },
    type: db.QueryTypes.SELECT,
  });

const updateOwnershipRequestQuery = `
  UPDATE cqc."OwnerChangeRequest"
  SET "approvalStatus" = :approvalStatus, "approvalReason" = :rejectionReason, "updatedByUserUID" = :userUid
  WHERE "subEstablishmentID" = :EstablishmentID;`;
exports.updateOwnershipRequest = async (params) =>
  db.query(updateOwnershipRequestQuery, {
    replacements: {
      EstablishmentID: params.subEstablishmentId,
      rejectionReason: params.rejectionReason,
      approvalStatus: params.approvalStatus,
      userUid: params.userUid,
    },
    type: db.QueryTypes.UPDATE,
  });

'use strict';

const db = rfr('server/utils/datastore');

const linkToParentRequestQuery = `
  INSERT INTO cqc."LinkToParent"
  ("LinkToParentUID", "ParentEstablishmentID", "SubEstablishmentID", "PermissionRequest", "ApprovalStatus", "RejectionReason", "CreatedByUserUID", "UpdatedByUserUID")
VALUES (:linkToParentUid, :parentEstablishmentId, :subEstId, :dataPermissions, :approvalStatus, :rejectionReason, :userUid, :userUid);`;

exports.linkToParentRequest = async params =>
  db.query(linkToParentRequestQuery, {
    replacements: {
      linkToParentUid: params.linkToParentUID,
      parentEstablishmentId: params.parentEstablishmentId,
      subEstId: params.subEstablishmentId,
      parentUid: params.parentWorkplaceId,
      dataPermissions: params.permissionRequest,
      userUid: params.userUid,
      approvalStatus: params.approvalStatus,
      rejectionReason: params.rejectionReason,
    },
    type: db.QueryTypes.INSERT,
  });

const getLinkToParentRequestQuery = `
    SELECT "LinkToParentUID", "PermissionRequest", "ApprovalStatus", "Created", "CreatedByUserUID"
    FROM cqc."LinkToParent"
    WHERE cqc."LinkToParent"."SubEstablishmentID" = :subEstId
    ORDER BY cqc."LinkToParent"."Created" DESC
    LIMIT :limit;
  `;

exports.getLinkToParentRequest = async params =>
  db.query(getLinkToParentRequestQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      limit: 1,
    },
    type: db.QueryTypes.SELECT,
  });

const checkAlreadyRequestedLinkToParentQuery = `
  SELECT "SubEstablishmentID", "ApprovalStatus"
  FROM cqc."LinkToParent"
  WHERE "SubEstablishmentID" = :subEstId
  AND "ApprovalStatus" = :status;
  `;

exports.checkAlreadyRequestedLinkToParent = async params =>
  db.query(checkAlreadyRequestedLinkToParentQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      status: 'REQUESTED',
    },
    type: db.QueryTypes.SELECT,
  });

const getRecipientUserDetailsQuery = `
  select "UserUID" from cqc."Establishment" est
  LEFT JOIN cqc."Establishment" parent ON parent."EstablishmentID" = est."ParentID"
  JOIN cqc."User" individual ON individual."EstablishmentID" = COALESCE(parent."EstablishmentID", est."EstablishmentID")
  WHERE :estID = est."EstablishmentUID" AND individual."UserRoleValue" = :userRole AND est."IsParent" = :isParent `;

exports.getRecipientUserDetails = async params =>
  db.query(getRecipientUserDetailsQuery, {
    replacements: {
      estID: params.parentWorkplaceUId,
      userRole: 'Edit',
      isParent: true,
    },
    type: db.QueryTypes.SELECT,
  });

const getLinkToParentDetailsQuery = `
  SELECT "LinkToParentUID", "SubEstablishmentID", "ApprovalStatus", "CreatedByUserUID"
  FROM cqc."LinkToParent"
  WHERE "SubEstablishmentID" = :subEstId ORDER BY "created" DESC LIMIT :limit;
  `;
exports.getLinkToParentDetails = async params =>
  db.query(getLinkToParentDetailsQuery, {
    replacements: {
      subEstId: params.subEstablishmentId,
      limit: params.limit,
    },
    type: db.QueryTypes.SELECT,
  });

const getLinkToParentUidQuery = `
  select "LinkToParentUID" from cqc."LinkToParent" where
  "SubEstablishmentID" = :estID AND "ApprovalStatus" = :approvalStatus`;

exports.getLinkToParentUid = async params =>
  db.query(getLinkToParentUidQuery, {
    replacements: {
      estID: params.establishmentId,
      approvalStatus: 'REQUESTED',
    },
    type: db.QueryTypes.SELECT,
  });

const cancelLinkToParentQuery = `
  UPDATE cqc."LinkToParent"
SET "ApprovalStatus" = :approvalStatus
WHERE "LinkToParentUID" = :uid;`;

exports.cancelLinkToParent = async params =>
  db.query(cancelLinkToParentQuery, {
    replacements: {
      uid: params.linkToParentUid,
      approvalStatus: params.approvalStatus,
    },
    type: db.QueryTypes.UPDATE,
  });

const updateLinkToParentQuery = `
  select "LinkToParentUID", "ApprovalStatus", "PermissionRequest",
  parent."NameValue" as "requstedParentName"
  from cqc."LinkToParent" as sub
  JOIN cqc."Establishment" as parent on sub."ParentEstablishmentID" =  parent."EstablishmentID"
  where "LinkToParentUID" = :uid `;

exports.updateLinkToParent = async params =>
  db.query(updateLinkToParentQuery, {
    replacements: {
      uid: params.linkToParentUid,
    },
    type: db.QueryTypes.SELECT,
  });

  const getNotificationDetailsQuery = `
  select "ApprovalStatus" as "approvalStatus", "PermissionRequest" as "permissionRequest",
  parent."NameValue" as "parentEstablishmentName"
  from cqc."LinkToParent" as sub
  JOIN cqc."Establishment" as parent on sub."ParentEstablishmentID" =  parent."EstablishmentID"
  where "LinkToParentUID" = :uid `;

exports.getNotificationDetails = async params =>
  db.query(getNotificationDetailsQuery, {
    replacements: {
      uid: params.typeUid,
    },
    type: db.QueryTypes.SELECT,
  });

  const getSubEstablishmentNameQuery = `
  select  parent."NameValue" as "subEstablishmentName"
  from cqc."LinkToParent" as sub
  JOIN cqc."Establishment" as parent on sub."SubEstablishmentID" =  parent."EstablishmentID"
  where "LinkToParentUID" = :uid `;

exports.getSubEstablishmentName = async params =>
  db.query(getSubEstablishmentNameQuery, {
    replacements: {
      uid: params.typeUid,
    },
    type: db.QueryTypes.SELECT,
  });

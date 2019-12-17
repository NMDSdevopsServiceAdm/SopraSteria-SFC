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

const updatedLinkToParentQuery = `
  UPDATE cqc."LinkToParent"
SET "ApprovalStatus" = :approvalStatus
WHERE "LinkToParentUID" = :uid;`;

exports.updatedLinkToParent = async params =>
  db.query(updatedLinkToParentQuery, {
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
  select  parent."NameValue" as "subEstablishmentName", sub."ParentEstablishmentID" as parentEstablishmentId,sub."RejectionReason" as rejectionReason, sub."SubEstablishmentID" as subEstablishmentId
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

const checkLinkToParentUidQuery = `
  select  notify."typeUid", link."ApprovalStatus"  as "approvalStatus"
  from cqc."Notifications" as notify
  JOIN cqc."LinkToParent" as link on notify."typeUid" =  link."LinkToParentUID"
  where "notificationUid" = :notificationUid `;

exports.checkLinkToParentUid = async params =>
  db.query(checkLinkToParentUidQuery, {
    replacements: {
      notificationUid: params.notificationUid,
    },
    type: db.QueryTypes.SELECT,
  });

const updateNotificationQuery = `
  UPDATE cqc."Notifications"
  SET "isViewed" = :isViewed
  WHERE "Notifications"."notificationUid" = :notificationUid`;

exports.updateNotification = async params =>
  db.query(updateNotificationQuery, {
    replacements: {
      notificationUid: params.notificationUid,
      isViewed: false,
    },
    type: db.QueryTypes.UPDATE,
  });

const getSubUserDetailsQuery = `
  select "UserUID" from cqc."Establishment" est
  LEFT JOIN cqc."Establishment" parent ON parent."EstablishmentID" = est."ParentID"
  JOIN cqc."User" individual ON individual."EstablishmentID" = COALESCE(parent."EstablishmentID", est."EstablishmentID")
  WHERE :estID = est."EstablishmentUID" AND individual."UserRoleValue" = :userRole AND est."IsParent" = :isParent `;

exports.getSubUserDetails = async params =>
  db.query(getSubUserDetailsQuery, {
    replacements: {
      estID: params.parentWorkplaceUId,
      userRole: 'Edit',
      isParent: true,
    },
    type: db.QueryTypes.SELECT,
  });

const updatedLinkToParentIdQuery = `
  UPDATE cqc."Establishment"
SET "ParentID" = :parentId, "ParentUID" = :parentUid, "DataPermissions" = :permissionRequest
WHERE "EstablishmentID" = :estID;`;

exports.updatedLinkToParentId = async params =>
  db.query(updatedLinkToParentIdQuery, {
    replacements: {
      parentId: params.parentEstablishmentId,
      parentUid: params.parentUid,
      estID: params.subEstablishmentId,
      permissionRequest: params.permissionRequest,
    },
    type: db.QueryTypes.UPDATE,
  });

  const getParentUidQuery = `
  SELECT "EstablishmentUID"
  FROM cqc."Establishment"
  WHERE "EstablishmentID" = :subEstId;
  `;
exports.getParentUid = async params =>
  db.query(getParentUidQuery, {
    replacements: {
      subEstId: params.parentEstablishmentId,
    },
    type: db.QueryTypes.SELECT,
  });

  const getPermissionRequestQuery = `
  SELECT "PermissionRequest"
  FROM cqc."LinkToParent"
  WHERE "LinkToParentUID" = :linkToParentUid;
  `;
exports.getPermissionRequest = async params =>
  db.query(getPermissionRequestQuery, {
    replacements: {
      linkToParentUid: params.linkToParentUid,
    },
    type: db.QueryTypes.SELECT,
  });
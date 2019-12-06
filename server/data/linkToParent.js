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

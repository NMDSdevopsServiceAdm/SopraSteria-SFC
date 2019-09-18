'use strict';

const db = rfr('server/utils/datastore');

const insertChangeOwnershipQuery =
`
INSERT INTO
cqc."OwnerChangeRequest"
(subEstablishmentId, permissionRequest, createdByUserUID)
VALUES (:subEstId, :permReq, userUid);
`;

exports.changeOwnershipRequest = async (params) => {
    db.query(insertChangeOwnershipQuery, {
        replacements: {
            subEstId: params.subEstablishmentId,
            permReq: params.permissionRequest,
            userUid: params.userUid
          },
          type: db.QueryTypes.INSERT
    })
}
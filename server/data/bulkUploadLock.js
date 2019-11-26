'use strict';

const db = rfr('server/utils/datastore');

module.exports = {
  attemptToAcquireLock: async establishmentId =>
    db.query(`
      UPDATE
        cqc."Establishment"
      SET
        "bulkUploadLockHeld" = true
      WHERE
        "EstablishmentID" = :establishmentId AND
        "bulkUploadLockHeld" = false
    `, {
      replacements: {
        establishmentId
      },
      type: db.QueryTypes.UPDATE
    }),

  updateLockState: async (establishmentId, newState) =>
    db.query(`
      UPDATE
        cqc."Establishment"
      SET
        "bulkUploadState" = :newState
      WHERE
        "EstablishmentID" = :establishmentId AND
        "bulkUploadLockHeld" = true`,
    {
      replacements: {
        establishmentId,
        newState
      },
      type: db.QueryTypes.UPDATE
    }
    ),

  lockStatus: async establishmentId =>
    db.query(`
      SELECT
        "EstablishmentID" AS "establishmentId",
        "bulkUploadState",
        "bulkUploadLockHeld"
      FROM
        cqc."Establishment"
      WHERE
        "EstablishmentID" = :establishmentId`,
    {
      replacements: {
        establishmentId
      },
      type: db.QueryTypes.SELECT
    }
    ),

  releaseLockQuery: async (establishmentId, nextState) => {
    let query;

    if (nextState !== null) {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "bulkUploadLockHeld" = false,
          "bulkUploadState" = :nextState
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    } else {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "bulkUploadLockHeld" = false
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    }

    return db.query(query, {
      replacements: {
        establishmentId,
        nextState
      },
      type: db.QueryTypes.UPDATE
    });
  }
};

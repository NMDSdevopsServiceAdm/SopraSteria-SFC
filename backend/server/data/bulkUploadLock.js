'use strict';

const db = require('../utils/datastore');

module.exports = {
  attemptToAcquireLock: establishmentId =>
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

  updateLockState: (establishmentId, newState) =>
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

  lockStatus: establishmentId =>
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

  releaseLockQuery: (establishmentId, nextState) => {
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

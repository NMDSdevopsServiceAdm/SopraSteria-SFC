'use strict';

const db = require('../utils/datastore');

module.exports = {
  attemptToAcquireLock: establishmentId =>
    db.query(`
      UPDATE
        cqc."Establishment"
      SET
        "TrainingReportLockHeld" = true
      WHERE
        "EstablishmentID" = :establishmentId AND
        "TrainingReportLockHeld" = false
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
        "TrainingReportState" = :newState
      WHERE
        "EstablishmentID" = :establishmentId AND
        "TrainingReportLockHeld" = true`,
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
        "TrainingReportState",
        "TrainingReportLockHeld"
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
          "TrainingReportLockHeld" = false,
          "TrainingReportState" = :nextState
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    } else {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "TrainingReportLockHeld" = false
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

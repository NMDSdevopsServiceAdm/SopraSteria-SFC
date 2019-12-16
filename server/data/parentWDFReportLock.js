'use strict';

const db = rfr('server/utils/datastore');

module.exports = {
  attemptToAcquireLock: establishmentId =>
    db.query(`
      UPDATE
        cqc."Establishment"
      SET
        "wdfReportLockHeld" = true
      WHERE
        "EstablishmentID" = :establishmentId AND
        "wdfReportLockHeld" = false
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
        "wdfReportState" = :newState
      WHERE
        "EstablishmentID" = :establishmentId AND
        "wdfReportLockHeld" = true`,
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
        "wdfReportState",
        "wdfReportLockHeld"
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
          "wdfReportLockHeld" = false,
          "wdfReportState" = :nextState
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    } else {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "wdfReportLockHeld" = false
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

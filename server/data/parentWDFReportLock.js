'use strict';

const db = require('../utils/datastore');

module.exports = {
  attemptToAcquireLock: (establishmentId) =>
    db.query(
      `
      UPDATE
        cqc."Establishment"
      SET
        "WdfReportLockHeld" = true
      WHERE
        "EstablishmentID" = :establishmentId AND
        "WdfReportLockHeld" = false
    `,
      {
        replacements: {
          establishmentId,
        },
        type: db.QueryTypes.UPDATE,
      },
    ),

  updateLockState: (establishmentId, newState) =>
    db.query(
      `
      UPDATE
        cqc."Establishment"
      SET
        "WdfReportState" = :newState
      WHERE
        "EstablishmentID" = :establishmentId AND
        "WdfReportLockHeld" = true`,
      {
        replacements: {
          establishmentId,
          newState,
        },
        type: db.QueryTypes.UPDATE,
      },
    ),

  lockStatus: (establishmentId) =>
    db.query(
      `
      SELECT
        "EstablishmentID" AS "establishmentId",
        "WdfReportState",
        "WdfReportLockHeld"
      FROM
        cqc."Establishment"
      WHERE
        "EstablishmentID" = :establishmentId`,
      {
        replacements: {
          establishmentId,
        },
        type: db.QueryTypes.SELECT,
      },
    ),

  releaseLockQuery: (establishmentId, nextState) => {
    let query;

    if (nextState !== null) {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "WdfReportLockHeld" = false,
          "WdfReportState" = :nextState
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    } else {
      query = `
        UPDATE
          cqc."Establishment"
        SET
          "WdfReportLockHeld" = false
        WHERE
          "EstablishmentID" = :establishmentId
        `;
    }

    return db.query(query, {
      replacements: {
        establishmentId,
        nextState,
      },
      type: db.QueryTypes.UPDATE,
    });
  },
};

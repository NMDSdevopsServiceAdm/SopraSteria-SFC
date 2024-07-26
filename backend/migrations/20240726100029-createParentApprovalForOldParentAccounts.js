'use strict';
const models = require('../server/models/index');

const dateAccountsCreatedInService = new Date('2019-08-30T00:00:00Z');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const parentEstablishmentsWithoutApprovalRecord = await queryInterface.sequelize.query(
        `
          SELECT e."EstablishmentID", u."RegistrationID"
          FROM cqc."Establishment" e
          LEFT JOIN cqc."Approvals" a ON e."EstablishmentID" = a."EstablishmentID"
          JOIN cqc."User" u ON e."EstablishmentID" = u."EstablishmentID"
            WHERE a."EstablishmentID" IS NULL AND e."IsParent" = true
            AND e."IsRegulated" = true
            AND e."Archived" = false
            AND u."IsPrimary" = true;
        `,
        { type: Sequelize.QueryTypes.SELECT, transaction },
      );

      for (const establishment of parentEstablishmentsWithoutApprovalRecord) {
        await models.Approvals.create(
          {
            EstablishmentID: establishment.EstablishmentID,
            ApprovalType: 'BecomeAParent',
            UserID: establishment.RegistrationID,
            Status: 'Approved',
            createdAt: dateAccountsCreatedInService,
            updatedAt: dateAccountsCreatedInService,
          },
          {
            transaction,
            silent: true, // prevents updatedAt being overridden
          },
        );
      }
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.Approvals.destroy(
        {
          where: {
            createdAt: dateAccountsCreatedInService,
          },
        },
        { transaction },
      );
    });
  },
};

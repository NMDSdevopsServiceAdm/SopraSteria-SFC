'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`ALTER TYPE cqc."UserAuditChangeType" ADD VALUE IF NOT EXISTS 'delete';`)
  },

  down: (queryInterface, Sequelize) => {
    const query = `DELETE FROM pg_enum WHERE enumlabel = cqc."UserAuditChangeType"
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = cqc."UserAuditChangeType");`;
    return queryInterface.sequelize.query(query);
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `ALTER TYPE cqc."enum_Approvals_Status" ADD VALUE IF NOT EXISTS 'In progress'`,
    );
  },

  down: (queryInterface, Sequelize) => {
    const query = `DELETE FROM pg_enum WHERE enumlabel = cqc."enum_Approvals_Status"
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = cqc."enum_Approvals_Status)`;
    return queryInterface.sequelize.query(query);
  },
};

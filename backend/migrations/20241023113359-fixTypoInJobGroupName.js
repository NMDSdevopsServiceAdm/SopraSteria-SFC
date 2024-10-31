'use strict';

const table = {
  tableName: 'Job',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      queryInterface
        .removeColumn(table, 'JobRoleGroup', transaction)
        .then(async () => {
          await queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_Job_JobRoleGroup";', transaction);
        })
        .then(async () => {
          await queryInterface.addColumn(table, 'JobRoleGroup', {
            type: Sequelize.DataTypes.ENUM,
            values: [
              'Care providing roles',
              'Professional and related roles',
              'Managerial and supervisory roles',
              'IT, digital and data roles',
              'Other roles',
            ],
            transaction,
          });
        });
    });
  },

  async down(queryInterface) {},
};

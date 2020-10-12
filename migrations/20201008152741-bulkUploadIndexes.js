'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all(
      [
        await queryInterface.addIndex(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          {
            fields: ['EstablishmentID', 'ParentID', 'Archived'],
            concurrently: true,
            unique: true,
          },
        ),
        await queryInterface.addIndex(
          {
            tableName: 'services',
            schema: 'cqc',
          },
          {
            fields: ['id'],
            concurrently: true,
            unique: true,
          },
        ),
        queryInterface.addIndex(
          {
            tableName: 'ServiceUsers',
            schema: 'cqc',
          },
          {
            fields: ['ID'],
            concurrently: true,
            unique: true,
          },
        ),
        await queryInterface.addIndex(
          {
            tableName: 'Cssr',
            schema: 'cqc',
          },
          {
            fields: ['LocalCustodianCode'],
            concurrently: true,
            unique: true,
          },
        ),
        await queryInterface.addIndex(
          {
            tableName: 'Worker',
            schema: 'cqc',
          },
          {
            fields: ['WorkerUID', 'Archived'],
            concurrently: true,
            unique: true,
          },
        ),
      ],
      1,
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
DROP INDEX IF EXISTS cqc."establishment__establishment_i_d__parent_i_d__archived";
DROP INDEX IF EXISTS cqc."services_id";
DROP INDEX IF EXISTS cqc."service_users__i_d";
DROP INDEX IF EXISTS cqc."cssr__local_custodian_code";
DROP INDEX IF EXISTS cqc."worker__worker_u_i_d__archived";
    `);
  },
};

'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      return Promise.all([
        await queryInterface.addColumn(
          table,
          'showSharingPermissionsBanner',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
          },
          { transaction },
        ),
        await queryInterface.sequelize.query('UPDATE cqc."Establishment" SET "showSharingPermissionsBanner" = true;', {
          transaction,
        }),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'showSharingPerimissionsBanner');
  },
};

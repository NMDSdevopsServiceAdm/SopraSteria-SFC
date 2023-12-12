'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addIndex(
      {
        tableName: 'postcodes',
        schema: 'cqcref',
      },
      {
        fields: ['postcode'],
      },
    );
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(`
DROP INDEX IF EXISTS cqcref."postcodes_postcode";
    `);
  },
};

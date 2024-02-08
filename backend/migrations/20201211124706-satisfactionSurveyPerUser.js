'use strict';

const table = { tableName: 'SatisfactionSurvey', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(table, 'UserFK', {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'User',
          schema: 'cqc'
        },
        key: 'RegistrationID'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(table, 'UserFK', { transaction });
  }
};

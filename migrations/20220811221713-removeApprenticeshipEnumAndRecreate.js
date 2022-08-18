'use strict';
const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(table, 'ApprenticeshipTrainingValue', {
      type: Sequelize.ENUM('Yes', 'No', "Don't know", 'Think ahead', 'Social worker integrated Degree'),
      allowNull: true,
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(table, 'ApprenticeshipTrainingValue', {
      type: Sequelize.ENUM('Yes', 'No', "Don't know"),
      allowNull: true,
    });
  },
};

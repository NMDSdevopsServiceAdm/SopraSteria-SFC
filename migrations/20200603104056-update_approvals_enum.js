'use strict';
const replaceEnum = require('sequelize-replace-enum-postgres').default;
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET search_path to cqc').then(() => {
      return replaceEnum({
        queryInterface,
        tableName: 'Approvals',
        columnName: 'ApprovalType',
        newValues: ['BecomeAParent', 'CqcStatusChange'],
        enumName: 'enum_Approvals_ApprovalType'
      });
    }).then(() => {
      return queryInterface.sequelize.query('SET search_path to DEFAULT');
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET search_path to cqc').then(() => {
      return replaceEnum({
        queryInterface,
        tableName: 'Approvals',
        columnName: 'ApprovalType',
        newValues: ['BecomeAParent'],
        enumName: 'enum_Approvals_ApprovalType'
      });
    }).then(() => {
      return queryInterface.sequelize.query('SET search_path to DEFAULT');
    });
  }
}

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .renameTable({ tableName: 'RegistrationNotes', schema: 'cqc' }, 'Notes', { schema: 'cqc' })
      .then(() => {
        return queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_Notes_NoteType";');
      })
      .then(() => {
        return queryInterface.addColumn({ tableName: 'Notes', schema: 'cqc' }, 'NoteType', {
          type: Sequelize.DataTypes.ENUM,
          allowNull: false,
          values: ['Registration', 'Parent Request', 'Main Service'],
        });
      });
  },

  down: (queryInterface) => {
    return queryInterface
      .renameTable({ tableName: 'Notes', schema: 'cqc' }, 'RegistrationNotes', { schema: 'cqc' })
      .then(() => {
        return queryInterface.removeColumn({ tableName: 'RegistrationNotes', schema: 'cqc' }, 'NoteType');
      })
      .then(() => {
        return queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_Notes_NoteType";');
      });
  },
};

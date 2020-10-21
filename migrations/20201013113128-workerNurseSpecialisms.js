'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      try {
        await queryInterface.createTable('WorkerNurseSpecialisms', {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          WorkerFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'Worker',
                schema: 'cqc'
              },
              key: 'ID'
            }
          },
          NurseSpecialismFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'NurseSpecialism',
                schema: 'cqc'
              },
              key: 'ID'
            }
          }
        }, { schema: 'cqc', transaction });

        await queryInterface.addIndex({
          tableName: 'WorkerNurseSpecialisms',
          schema: 'cqc',
        },
        {
          fields: ['NurseSpecialismFK', 'WorkerFK'],
          unique: true,
          transaction
        });

        await Promise.all([
          queryInterface.addColumn(table, 'NurseSpecialismsValue', {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don''t know"]
          }, { transaction }),
          queryInterface.addColumn(table, 'NurseSpecialismsSavedAt', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          }, { transaction }),
          queryInterface.addColumn(table, 'NurseSpecialismsChangedAt', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          }, { transaction }),
          queryInterface.addColumn(table, 'NurseSpecialismsSavedBy', {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          }, { transaction }),
          queryInterface.addColumn(table, 'NurseSpecialismsChangedBy', {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          }, { transaction })
        ])

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }

    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      try {
        await queryInterface.dropTable({
          tableName: 'WorkerNurseSpecialisms',
          schema: 'cqc'
        }, { transaction });

        await Promise.all([
          queryInterface.removeColumn(table, 'NurseSpecialismsValue', { transaction }),
          queryInterface.removeColumn(table, 'NurseSpecialismsSavedAt', { transaction }),
          queryInterface.removeColumn(table, 'NurseSpecialismsChangedAt', { transaction }),
          queryInterface.removeColumn(table, 'NurseSpecialismsSavedBy', { transaction }),
          queryInterface.removeColumn(table, 'NurseSpecialismsChangedBy', { transaction })
        ]);

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    });

  }
};

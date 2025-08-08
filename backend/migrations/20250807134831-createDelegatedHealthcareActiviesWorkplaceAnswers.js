'use strict';

const junctionTable = { tableName: 'EstablishmentDHActivities', schema: 'cqc' };
const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const createJunctionTable = queryInterface.createTable(
        junctionTable,
        {
          EstablishmentID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: establishmentTable,
              key: 'EstablishmentID',
            },
          },
          DelegatedHealthcareActivitiesID: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: { tableName: 'DelegatedHealthcareActivities', schema: 'cqc' },
              key: 'ID',
            },
          },
        },
        { transaction },
      );

      const addColumnsToEstablishmentTable = [
        queryInterface.addColumn(
          establishmentTable,
          'DelegatedHealthcareActivitiesKindValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', "Don't know"],
          },
          { transaction },
        ),
        ['SavedAt', 'ChangedAt'].map((suffix) => {
          return queryInterface.addColumn(
            establishmentTable,
            `DelegatedHealthcareActivitiesKind${suffix}`,
            {
              type: Sequelize.DataTypes.DATE,
              allowNull: true,
            },
            { transaction },
          );
        }),
        ['SavedBy', 'ChangedBy'].map((suffix) => {
          return queryInterface.addColumn(
            establishmentTable,
            `DelegatedHealthcareActivitiesKind${suffix}`,
            {
              type: Sequelize.DataTypes.DATE,
              allowNull: true,
            },
            { transaction },
          );
        }),
      ];

      await Promise.all([createJunctionTable, ...addColumnsToEstablishmentTable]);
    });
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(junctionTable, { transaction });
      await queryInterface.removeColumn(establishmentTable, 'DelegatedHealthcareActivitiesKindValue', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'DelegatedHealthcareActivitiesKindSavedAt', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'DelegatedHealthcareActivitiesKindChangedAt', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'DelegatedHealthcareActivitiesKindSavedBy', { transaction });
      await queryInterface.removeColumn(establishmentTable, 'DelegatedHealthcareActivitiesKindChangedBy', { transaction });
    });
  },
};

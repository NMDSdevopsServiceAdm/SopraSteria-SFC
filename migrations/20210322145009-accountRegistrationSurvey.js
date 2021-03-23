'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable(
        'RegistrationSurvey',
        {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          EstablishmentFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'Establishment',
                schema: 'cqc',
              },
              key: 'EstablishmentID',
            },
          },
          Participation: {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No'],
          },
          WhyDidYouCreateAnAccount: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          HowDidYouHearAboutASCWDF: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          SubmittedDate: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
        },
        { schema: 'cqc' },
      ),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'RegistrationSurvey',
      schema: 'cqc',
    });
  },
};

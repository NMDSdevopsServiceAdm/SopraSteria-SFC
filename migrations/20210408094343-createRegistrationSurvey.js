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
          UserFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'User',
                schema: 'cqc',
              },
              key: 'RegistrationID',
            },
            unique: true,
          },
          WhyDidYouCreateAccount: {
            type: Sequelize.DataTypes.JSON,
            allowNull: true,
          },
          HowDidYouHearAboutASCWDS: {
            type: Sequelize.DataTypes.JSON,
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

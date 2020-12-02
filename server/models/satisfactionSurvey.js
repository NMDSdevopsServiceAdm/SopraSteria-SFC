const { Op } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const SatisfactionSurvey = sequelize.define(
    'satisfactionSurvey',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'ID'
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        field: 'EstablishmentFK'
      },
      didYouDoEverything: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'Some', 'No'],
        field: 'DidYouDoEverything'
      },
      didYouDoEverythingAdditionalAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'DidYouDoEverythingAdditionalAnswer'
      },
      howDidYouFeel: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Very satisfied', 'Satisfied', 'Neither', 'Dissatisfied', 'Very dissatisfied'],
        field: 'HowDidYouFeel'
      },
      submittedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'SubmittedDate'
      },
    },
    {
      tableName: 'SatisfactionSurvey',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  SatisfactionSurvey.countSubmissions = async function(establishmentId, fromDate) {
    return await this.count({
      where: {
        submittedDate: {
          [Op.gte]: fromDate
        },
        establishmentFk: establishmentId
      },
    });
  }

  return SatisfactionSurvey;
};

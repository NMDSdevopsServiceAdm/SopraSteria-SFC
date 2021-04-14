const { Op } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const SatisfactionSurvey = sequelize.define(
    'satisfactionSurvey',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        field: 'EstablishmentFK',
      },
      userFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"UserFK"',
      },
      didYouDoEverything: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'Some', 'No'],
        field: 'DidYouDoEverything',
      },
      didYouDoEverythingAdditionalAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'DidYouDoEverythingAdditionalAnswer',
      },
      howDidYouFeel: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Very satisfied', 'Satisfied', 'Neither', 'Dissatisfied', 'Very dissatisfied'],
        field: 'HowDidYouFeel',
      },
      submittedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'SubmittedDate',
      },
    },
    {
      tableName: 'SatisfactionSurvey',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  SatisfactionSurvey.associate = (models) => {
    SatisfactionSurvey.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      as: 'user',
    });

    SatisfactionSurvey.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
      as: 'establishment',
    });
  };

  SatisfactionSurvey.generateSatisfactionSurveyReportData = async function () {
    return await this.findAll({
      attributes: [
        'userFk',
        'submittedDate',
        'didYouDoEverything',
        'didYouDoEverythingAdditionalAnswer',
        'howDidYouFeel',
      ],
      order: [['submittedDate', 'ASC']],
      include: [
        {
          model: sequelize.models.user,
          attributes: ['FullNameValue', 'EmailValue'],
          as: 'user',
        },
        {
          model: sequelize.models.establishment,
          attributes: ['nmdsId'],
          as: 'establishment',
        },
      ],
    });
  };

  SatisfactionSurvey.countSubmissions = async function (userFk, fromDate) {
    return await this.count({
      where: {
        submittedDate: {
          [Op.gte]: fromDate,
        },
        userFk,
      },
    });
  };

  return SatisfactionSurvey;
};

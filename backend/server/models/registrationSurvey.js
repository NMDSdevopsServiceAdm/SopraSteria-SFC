module.exports = function (sequelize, DataTypes) {
  const RegistrationSurvey = sequelize.define(
    'registrationSurvey',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      userFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'UserFK',
      },
      whyDidYouCreateAccount: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'WhyDidYouCreateAccount',
      },
      howDidYouHearAboutASCWDS: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'HowDidYouHearAboutASCWDS',
      },
      submittedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'SubmittedDate',
      },
    },
    {
      tableName: 'RegistrationSurvey',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  RegistrationSurvey.associate = (models) => {
    RegistrationSurvey.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      as: 'user',
    });
  };

  return RegistrationSurvey;
};

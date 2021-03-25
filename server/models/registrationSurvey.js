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
        field: 'UserFK',
      },
      participation: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Yes', 'No'],
        field: 'Participation',
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

  return RegistrationSurvey;
};

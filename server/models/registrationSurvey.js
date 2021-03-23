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
      establishmentFk: {
        type: DataTypes.INTEGER,
        field: 'EstablishmentFK',
      },
      participation: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ['Yes', 'No'],
        field: 'Participation',
      },
      whyDidYouCreateAnAccount: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'WhyDidYouCreateAnAccount',
      },
      howDidYouHearAboutASCWDF: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'HowDidYouHearAboutASCWDF',
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
    RegistrationSurvey.belongsTo(models.establishment, {
      foreignKey: 'establishmentFK',
      targetKey: 'id',
      as: 'establishment',
    });
  };

  return RegistrationSurvey;
};

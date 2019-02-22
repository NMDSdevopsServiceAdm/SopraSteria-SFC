/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"RegistrationID"'
    },
    fullname: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      field: '"FullNameValue"'
    },
    jobTitle: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"JobTitleValue"'
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "EmailValue"
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PhoneValue"'
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentID"'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"AdminUser"'
    },
    securityQuestion: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"SecurityQuestionValue"'
    },
    securityAnswer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"SecurityQuestionAnswerValue"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated'
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'updatedby'
    },
  }, {
    tableName: '"User"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  User.associate = (models) => {
    User.belongsTo(models.establishment, {
      foreignKey : 'establishmentId',
      targetKey: 'id'
    });
    User.hasOne(models.login, {
      foreignKey : 'id',
      targetKey: 'registrationId'
    });
  };
  return User;
};

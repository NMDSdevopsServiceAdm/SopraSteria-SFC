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
    uid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: '"UserUID"'
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentID"'
    },
    FullNameValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
      field: '"FullNameValue"'
    },
    FullNameSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"FullNameSavedAt"'
    },
    FullNameChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"FullNameChangedAt"'
    },
    FullNameSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"FullNameSavedBy"'
    },
    FullNameChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"FullNameChangedBy"'
    },
    JobTitleValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"JobTitleValue"'
    },
    JobTitleSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"JobTitleSavedAt"'
    },
    JobTitleChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"JobTitleChangedAt"'
    },
    JobTitleSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"JobTitleSavedBy"'
    },
    JobTitleChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"JobTitleChangedBy"'
    },
    EmailValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "EmailValue"
    },
    EmailSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EmailSavedAt"'
    },
    EmailChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"EmailChangedAt"'
    },
    EmailSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EmailSavedBy"'
    },
    EmailChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"EmailChangedBy"'
    },
    PhoneValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PhoneValue"'
    },
    PhoneSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PhoneSavedAt"'
    },
    PhoneChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"PhoneChangedAt"'
    },
    PhoneSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PhoneSavedBy"'
    },
    PhoneChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"PhoneChangedBy"'
    },
    SecurityQuestionValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"SecurityQuestionValue"'
    },
    SecurityQuestionSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SecurityQuestionSavedAt"'
    },
    SecurityQuestionChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SecurityQuestionChangedAt"'
    },
    SecurityQuestionSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SecurityQuestionSavedBy"'
    },
    SecurityQuestionChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SecurityQuestionChangedBy"'
    },
    SecurityQuestionAnswerValue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"SecurityQuestionAnswerValue"'
    },
    SecurityQuestionAnswerSavedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SecurityQuestionAnswerSavedAt"'
    },
    SecurityQuestionAnswerChangedAt : {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"SecurityQuestionAnswerChangedAt"'
    },
    SecurityQuestionAnswerSavedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SecurityQuestionAnswerSavedBy"'
    },
    SecurityQuestionAnswerChangedBy : {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SecurityQuestionAnswerChangedBy"'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"AdminUser"'
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
      foreignKey : 'registrationId',
      targetKey: 'id'
    });
    User.hasMany(models.userAudit, {
      foreignKey: 'userFk',
      sourceKey: 'id',
      as: 'auditEvents'
    });
  };
  return User;
};

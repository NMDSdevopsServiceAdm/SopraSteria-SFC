/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    registrationId: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
      field: '"RegistrationID"'
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Username"'
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "Password"
    },
    securityQuestion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"SecurityQuestion"'
    },
    securityAnswer: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: '"SecurityQuestionAnswer"'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"Active"'
    },
    invalidAttempt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"InvalidAttempt"'
    }
  }, {
    tableName: '"Login"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
};

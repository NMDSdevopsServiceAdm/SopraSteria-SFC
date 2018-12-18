/* jshint indent: 2 */
const models = require('./index');

module.exports = function(sequelize, DataTypes) {
  const Login = sequelize.define('login', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    registrationId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: '"RegistrationID"'
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: '"Username"'
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "Password"
    },
    securityQuestion: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"SecurityQuestion"'
    },
    securityAnswer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"SecurityQuestionAnswer"'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"Active"'
    },
    invalidAttempt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"InvalidAttempt"'
    },
    firstLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: '"FirstLogin'
    }
  }, {
    tableName: '"Login"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  Login.associate = (models) => {
    Login.belongsTo(models.user, {
      foreignKey: 'registrationId',
      targetKey: 'id'
    });
  };

  return Login;
};

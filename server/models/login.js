/* jshint indent: 2 */
const models = require('./index');
var bcrypt = require('bcrypt-nodejs');

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
    },
    Hash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "Hash"
    }

  }, {
    tableName: '"Login"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  Login.prototype.comparePassword = function (passw, cb) {
    console.log(this.password);
    bcrypt.compare(passw, this.Hash, function (err, isMatch) {
     // console.log("inside")
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
  };
  Login.associate = (models) => {
    Login.belongsTo(models.user, {
      foreignKey: 'registrationId',
      targetKey: 'id'
    });
  };

  return Login;
};

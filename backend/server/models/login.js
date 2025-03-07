/* jshint indent: 2 */
var bcrypt = require('bcrypt-nodejs');
const { MaxLoginAttempts, MaxFindUsernameAttempts, UserAccountStatus } = require('../data/constants');

module.exports = function (sequelize, DataTypes) {
  const Login = sequelize.define(
    'login',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      registrationId: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: '"RegistrationID"',
      },
      username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: '"Username"',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"Active"',
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Status"',
      },
      invalidAttempt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"InvalidAttempt"',
      },
      invalidFindUsernameAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"InvalidFindUsernameAttempts"',
      },
      firstLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"FirstLogin',
      },
      Hash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Hash',
      },
      passwdLastChanged: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: '"PasswdLastChanged',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"LastLoggedIn"',
      },
      tribalHash: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'TribalHash',
      },
      tribalSalt: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'TribalSalt',
      },
      agreedUpdatedTerms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"AgreedUpdatedTerms"',
      },
    },
    {
      tableName: '"Login"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  // uses the current
  Login.prototype.hashPassword = function () {
    return bcrypt.hashSync(this.password, bcrypt.genSaltSync(10), null);
  };

  Login.prototype.comparePassword = function (passw, err, tribalHashValidated, cb) {
    // not comfortable doing this, but owing to the
    //  existing login callback approach and the need to reuse the
    //  callback but to be able to intercept a tribal hash, need
    //  to be able to pass in any err to shortcut the calling of callback (cb)
    if (err) {
      return cb(err, false, false);
    } else if (tribalHashValidated) {
      // then we used the tribal has to validate - and no err means successfully
      // so we need to rehash
      return cb(err, true, true);
    } else {
      bcrypt.compare(passw, this.Hash, function (err, isMatch) {
        if (err) {
          return cb(err, false, false);
        }
        cb(null, isMatch, false);
      });
    }
  };
  Login.associate = (models) => {
    Login.belongsTo(models.user, {
      foreignKey: 'registrationId',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });
  };

  Login.findByUsername = async function (username) {
    return await this.findOne({
      attributes: ['id', 'registrationId', 'username'],
      where: {
        username,
      },
      include: [
        {
          model: sequelize.models.user,
          attributes: ['id', 'establishmentId'],
        },
      ],
    });
  };

  Login.prototype.recordInvalidFindUsernameAttempts = async function (transaction) {
    const loginAccount = await Login.findByPk(this.id);

    const previousAttempts = loginAccount.invalidFindUsernameAttempts ?? 0;
    const updatedFields = {
      invalidFindUsernameAttempts: previousAttempts + 1,
    };
    const options = transaction ? { transaction } : {};

    return this.update(updatedFields, options);
  };

  Login.prototype.lockAccount = async function (transaction) {
    const updatedFields = {
      isActive: false,
      status: UserAccountStatus.Locked,
    };

    const options = transaction ? { transaction } : {};

    return this.update(updatedFields, options);
  };

  Login.prototype.unlockAccount = async function (transaction) {
    const loginAccount = await Login.findByPk(this.id);
    const updatedFields = {
      isActive: true,
      status: null,
    };
    const options = transaction ? { transaction } : {};

    if (loginAccount.invalidAttempt >= MaxLoginAttempts) {
      updatedFields.invalidAttempt = MaxLoginAttempts - 1;
    }

    if (loginAccount.invalidFindUsernameAttempts >= MaxFindUsernameAttempts) {
      updatedFields.invalidFindUsernameAttempts = MaxFindUsernameAttempts - 1;
    }

    return this.update(updatedFields, options);
  };

  return Login;
};

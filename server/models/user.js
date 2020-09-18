/* jshint indent: 2 */
const { Op } = require('sequelize');
const { sanitise } = require('../utils/db');

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"RegistrationID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"UserUID"',
      },
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"EstablishmentID"',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
        field: '"Archived"',
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: true,
        field: '"IsPrimary"',
      },
      FullNameValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
        field: '"FullNameValue"',
      },
      FullNameSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"FullNameSavedAt"',
      },
      FullNameChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"FullNameChangedAt"',
      },
      FullNameSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"FullNameSavedBy"',
      },
      FullNameChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"FullNameChangedBy"',
      },
      JobTitleValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"JobTitleValue"',
      },
      JobTitleSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"JobTitleSavedAt"',
      },
      JobTitleChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"JobTitleChangedAt"',
      },
      JobTitleSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"JobTitleSavedBy"',
      },
      JobTitleChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"JobTitleChangedBy"',
      },
      EmailValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'EmailValue',
      },
      EmailSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmailSavedAt"',
      },
      EmailChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"EmailChangedAt"',
      },
      EmailSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmailSavedBy"',
      },
      EmailChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EmailChangedBy"',
      },
      PhoneValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"PhoneValue"',
      },
      PhoneSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PhoneSavedAt"',
      },
      PhoneChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"PhoneChangedAt"',
      },
      PhoneSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PhoneSavedBy"',
      },
      PhoneChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PhoneChangedBy"',
      },
      SecurityQuestionValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SecurityQuestionValue"',
      },
      SecurityQuestionSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SecurityQuestionSavedAt"',
      },
      SecurityQuestionChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SecurityQuestionChangedAt"',
      },
      SecurityQuestionSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SecurityQuestionSavedBy"',
      },
      SecurityQuestionChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SecurityQuestionChangedBy"',
      },
      SecurityQuestionAnswerValue: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"SecurityQuestionAnswerValue"',
      },
      SecurityQuestionAnswerSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SecurityQuestionAnswerSavedAt"',
      },
      SecurityQuestionAnswerChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"SecurityQuestionAnswerChangedAt"',
      },
      SecurityQuestionAnswerSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SecurityQuestionAnswerSavedBy"',
      },
      SecurityQuestionAnswerChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"SecurityQuestionAnswerChangedBy"',
      },
      UserRoleValue: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Read', 'Edit', 'Admin'],
        default: 'Edit',
        field: '"UserRoleValue"',
      },
      UserRoleSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"UserRoleSavedAt"',
      },
      UserRoleChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"UserRoleChangedAt"',
      },
      UserRoleSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"UserRoleSavedBy"',
      },
      UserRoleChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"UserRoleChangedBy"',
      },
      tribalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"TribalID"',
      },
      laReportLockHeld: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'LaReportLockHeld',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'updatedby',
      },
    },
    {
      tableName: '"User"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  const buildUserQuery = (where) => {
    let userQuery = {};
    if (where.name) {
      userQuery = {
        FullNameValue: {
          [Op.iLike]: sanitise(where.name),
        },
      };
    }
    return userQuery;
  };

  const buildLoginQuery = (where) => {
    let loginQuery = {};
    if (where.username) {
      loginQuery = {
        username: {
          [Op.iLike]: sanitise(where.username),
        },
      };
    }
    return loginQuery;
  };

  User.associate = (models) => {
    User.belongsTo(models.establishment, {
      foreignKey: 'establishmentId',
      targetKey: 'id',
      hooks: true,
      onDelete: 'CASCADE',
    });
    User.hasOne(models.login, {
      foreignKey: 'registrationId',
      targetKey: 'id',
      hooks: true,
      onDelete: 'CASCADE',
    });
    User.hasMany(models.userAudit, {
      foreignKey: 'userFk',
      sourceKey: 'id',
      as: 'auditEvents',
      hooks: true,
      onDelete: 'CASCADE',
    });
  };

  User.findByUUID = function (uuId) {
    return this.findOne({ where: { uid: uuId } });
  };

  User.closeLock = async function (LockHeldTitle, userUid) {
    return await this.update(
      {
        [LockHeldTitle]: true,
      },
      {
        where: {
          uid: userUid,
          [LockHeldTitle]: false,
        },
      },
    );
  };
  User.openLock = async function (LockHeldTitle, userId) {
    return await this.update(
      {
        [LockHeldTitle]: false,
      },
      {
        where: {
          uid: userId,
        },
      },
    );
  };
  User.searchUsers = async function (where) {
    const userQuery = buildUserQuery(where);
    const loginQuery = buildLoginQuery(where);

    return await this.findAll({
      attributes: [
        'uid',
        'FullNameValue',
        'isPrimary',
        'SecurityQuestionValue',
        'SecurityQuestionAnswerValue',
        'EmailValue',
        'PhoneValue',
      ],
      where: {
        archived: false,
        ...userQuery,
      },
      include: [
        {
          model: sequelize.models.login,
          attributes: ['username', 'isActive', 'passwdLastChanged', 'invalidAttempt', 'lastLogin'],
          where: {
            ...loginQuery,
          },
          required: true,
        },
        {
          model: sequelize.models.establishment,
          attributes: [
            'uid',
            'locationId',
            'nmdsId',
            'postcode',
            'isRegulated',
            'address1',
            'isParent',
            'NameValue',
            'updated',
            'ParentID',
          ],
          required: true,
          include: [
            {
              model: sequelize.models.establishment,
              attributes: ['id', 'uid', 'nmdsId', 'postcode', 'NameValue'],
              as: 'Parent',
              required: false,
            },
          ],
        },
      ],
    });
  };

  return User;
};

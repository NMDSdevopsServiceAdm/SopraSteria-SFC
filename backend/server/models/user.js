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
        values: ['None', 'Read', 'Edit', 'Admin', 'AdminManager'],
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
      registrationSurveyCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'RegistrationSurveyCompleted',
      },
      CanManageWdfClaimsValue: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"CanManageWdfClaimsValue"',
      },
      CanManageWdfClaimsSavedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CanManageWdfClaimsSavedAt"',
      },
      CanManageWdfClaimsChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"CanManageWdfClaimsChangedAt"',
      },
      CanManageWdfClaimsSavedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CanManageWdfClaimsSavedBy"',
      },
      CanManageWdfClaimsChangedBy: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"CanManageWdfClaimsChangedBy"',
      },
    },
    {
      tableName: '"User"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

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

  const buildSearchQuery = (field, columnName) => {
    let query = {};
    if (field) {
      query = {
        [columnName]: {
          [Op.iLike]: sanitise(field),
        },
      };
    }
    return query;
  };

  User.findByUUID = function (uuId) {
    return this.findOne({ where: { uid: uuId } });
  };

  User.findByLoginId = function (loginId) {
    return this.findOne({
      where: { id: loginId },
      attributes: ['id'],
    });
  };

  User.getCanManageWdfClaims = function (userUid) {
    return this.findOne({
      where: { uid: userUid },
      attributes: ['CanManageWdfClaimsValue'],
    });
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
    const userQuery = buildSearchQuery(where.name, '$user.FullNameValue$');
    const emailQuery = buildSearchQuery(where.emailAddress, '$user.EmailValue$');

    const whereClause = where.username
      ? {
          '$login.Username$': { [Op.iLike]: where.username },
        }
      : {
          '$user.Archived$': false,
          ...userQuery,
          ...emailQuery,
        };

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
      where: whereClause,
      include: [
        {
          model: sequelize.models.login,
          attributes: ['username', 'isActive', 'passwdLastChanged', 'invalidAttempt', 'lastLogin'],
          where: whereClause,
          required: false,
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
            'ustatus',
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

  User.allPrimaryUsers = async function (where = {}) {
    return await this.findAll({
      attributes: [
        [sequelize.literal('DISTINCT ON ("user"."EmailValue") "user"."EmailValue"'), 'email'],
        'id',
        'FullNameValue',
      ],
      where: {
        isPrimary: true,
        archived: false,
      },
      include: [
        {
          model: sequelize.models.establishment,
          attributes: ['id', 'nmdsId', 'NameValue'],
          where,
        },
      ],
    });
  };

  User.createAdminUser = async function (adminUser) {
    const { fullname, jobTitle, email, phone, role, uid, updatedBy } = adminUser;
    return this.create({
      FullNameValue: fullname,
      JobTitleValue: jobTitle,
      EmailValue: email,
      PhoneValue: phone,
      UserRoleValue: role,
      isPrimary: false,
      CanManageWdfClaimsValue: false,
      archived: false,
      uid,
      updatedBy,
    });
  };

  User.fetchAdminUsers = async function () {
    return this.findAll({
      attributes: [
        'RegistrationID',
        'uid',
        'Archived',
        'IsPrimary',
        'FullNameValue',
        'JobTitleValue',
        'EmailValue',
        'PhoneValue',
        'UserRoleValue',
        'updated',
      ],
      where: {
        UserRoleValue: { [Op.or]: ['Admin', 'AdminManager'] },
        Archived: false,
      },
      include: [
        {
          model: sequelize.models.login,
          attributes: ['username', 'status'],
        },
      ],
      order: [['updated', 'DESC']],
    });
  };

  return User;
};

const { Op } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const UserAudit = sequelize.define(
    'userAudit',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      userFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"UserFK"',
      },
      username: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Username"',
      },
      when: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: '"When"',
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          'created',
          'updated',
          'saved',
          'changed',
          'passwdReset',
          'loginSuccess',
          'loginFailed',
          'loginWhileLocked',
          'logout',
          'delete',
        ],
        field: '"EventType"',
      },
      property: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PropertyName"',
      },
      event: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: '"ChangeEvents"',
      },
    },
    {
      tableName: '"UserAudit"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false, // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    },
  );

  UserAudit.associate = (models) => {
    UserAudit.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      as: 'user',
    });
  };

  UserAudit.countLogouts = async function (userFk, fromDate) {
    return await this.count({
      where: {
        when: {
          [Op.gte]: fromDate,
        },
        type: 'logout',
        userFk,
      },
    });
  };

  return UserAudit;
};

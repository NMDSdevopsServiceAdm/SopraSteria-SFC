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

  return UserAudit;
};

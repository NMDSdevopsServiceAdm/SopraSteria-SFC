module.exports = function (sequelize, DataTypes) {
  const PasswordTracking = sequelize.define(
    'passwordTracking',
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
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: '"Created"',
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
        field: '"Expires"',
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        field: '"ResetUuid"',
      },
      completed: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Completed"',
      },
    },
    {
      tableName: '"PasswdResetTracking"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false, // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    },
  );

  return PasswordTracking;
};

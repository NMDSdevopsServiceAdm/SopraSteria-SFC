module.exports = function (sequelize, DataTypes) {
  const AddUSerTracking = sequelize.define(
    'addUserTracking',
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
        field: '"AddUuid"',
      },
      completed: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Completed"',
      },
      by: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
        field: '"RegisteredBy"',
      },
    },
    {
      tableName: '"AddUserTracking"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false, // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    },
  );

  AddUSerTracking.associate = (models) => {
    AddUSerTracking.belongsTo(models.user, {
      foreignKey: 'userFk',
      targetKey: 'id',
      onDelete: 'CASCADE',
    });
  };

  return AddUSerTracking;
};

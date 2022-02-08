module.exports = function (sequelize, DataTypes) {
  const EstablishmentLastLoginAndLastUpdatedView = sequelize.define(
    'establishmentLastLoginAndLastUpdatedView',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        field: '"EstablishmentID"',
      },
      nameValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"NameValue"',
      },
      isParent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'IsParent',
      },
      nmdsId: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"NmdsID"',
      },
      dataOwner: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"DataOwner"',
      },
      primaryUserName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PrimaryUserName"',
      },
      primaryUserEmail: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PrimaryUserEmail"',
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'LastUdpated',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'LastLogin',
      },
    },
    {
      tableName: '"EstablishmentLastLoginAndLastUpdated"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return EstablishmentLastLoginAndLastUpdatedView;
};

module.exports = function (sequelize, DataTypes) {
  const LastUpdatedEstablishmentsView = sequelize.define(
    'lastUpdatedEstablishmentsView',
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
      parentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: '"ParentID"',
      },
      isParent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: '"IsParent"',
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
        field: 'LastUpdated',
      },
    },
    {
      tableName: '"LastUpdatedEstablishments"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return LastUpdatedEstablishmentsView;
};

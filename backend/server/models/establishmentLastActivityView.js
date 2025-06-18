module.exports = function (sequelize, DataTypes) {
  const EstablishmentLastActivityView = sequelize.define(
    'establishmentLastActivityView',
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
      address1: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Address1',
      },
      town: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Town',
      },
      county: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'County',
      },
      postcode: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'PostCode',
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
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'LastLogin',
      },
      locationId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'LocationID',
      },
      parentNmdsId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ParentNmdsID',
      },
    },
    {
      tableName: '"EstablishmentLastActivity"',
      schema: 'cqc',
      timestamps: false,
    },
  );

  return EstablishmentLastActivityView;
};

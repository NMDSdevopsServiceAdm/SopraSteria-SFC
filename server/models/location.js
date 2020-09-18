/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'location',
    {
      locationid: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      locationname: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      addressline1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      addressline2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      towncity: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      county: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      postalcode: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mainservice: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'location',
      schema: 'cqcref',
      createdAt: false,
      updatedAt: false,
    },
  );
};

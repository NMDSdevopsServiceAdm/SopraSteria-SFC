/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const country = sequelize.define(
    'country',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        field: '"ID"',
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Seq',
      },
      country: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Country"',
      },
    },
    {
      tableName: 'Country',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return country;
};

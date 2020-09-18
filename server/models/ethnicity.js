/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Ethnicity = sequelize.define(
    'ethnicity',
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
      group: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"EthnicityGroup"',
      },
      ethnicity: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Ethnicity"',
      },
    },
    {
      tableName: 'Ethnicity',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return Ethnicity;
};

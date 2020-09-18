/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const qualification = sequelize.define(
    'qualification',
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
      level: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Level"',
      },
    },
    {
      tableName: 'Qualification',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return qualification;
};

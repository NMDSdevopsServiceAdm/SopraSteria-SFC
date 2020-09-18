/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const nationality = sequelize.define(
    'nationality',
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
      nationality: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Nationality"',
      },
    },
    {
      tableName: 'Nationality',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return nationality;
};

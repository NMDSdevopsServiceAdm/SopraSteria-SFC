/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Specialisms = sequelize.define(
    'workerNurseSpecialism',
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
      specialism: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Specialism"',
      },
      other: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"Other"',
      },
    },
    {
      tableName: 'NurseSpecialism',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return Specialisms;
};

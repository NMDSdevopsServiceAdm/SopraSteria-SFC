/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentServices = sequelize.define(
    'establishmentServices',
    {
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: '"EstablishmentID"',
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: '"ServiceID"',
      },
      other: {
        type: DataTypes.TEXT,
        allowNull: true,
        primaryKey: false,
        field: '"Other"',
      },
    },
    {
      tableName: '"EstablishmentServices"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return EstablishmentServices;
};

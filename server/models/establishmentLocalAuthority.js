/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentLocalAuthority = sequelize.define(
    'establishmentLocalAuthority',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"EstablishmentLocalAuthorityID"',
      },
      cssrId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"CssrID"',
      },
      cssr: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"CssR"',
      },
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentID"',
      },
    },
    {
      tableName: '"EstablishmentLocalAuthority"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return EstablishmentLocalAuthority;
};

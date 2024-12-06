/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentLeavers = sequelize.define(
    'establishmentLeavers',
    {
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"JobID"',
      },
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentID"',
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Leavers'],
        default: 'Leavers',
        field: '"JobType"',
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"Total"',
      },
    },
    {
      tableName: '"LeaversVW"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentLeavers.associate = (models) => {
    EstablishmentLeavers.belongsTo(models.job, {
      foreignKey: 'jobId',
      targetKey: 'id',
      as: 'reference',
    });
  };

  // this prevent sequelize from injecting it's own primary key!
  EstablishmentLeavers.removeAttribute('id');

  return EstablishmentLeavers;
};

/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentJobs = sequelize.define(
    'establishmentJobs',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"EstablishmentJobID"',
      },
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
        values: ['Vacancies', 'Starters', 'Leavers'],
        field: '"JobType"',
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"Total"',
      },
    },
    {
      tableName: '"EstablishmentJobs"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentJobs.associate = (models) => {
    EstablishmentJobs.belongsTo(models.job, {
      foreignKey: 'jobId',
      targetKey: 'id',
      as: 'reference',
    });
  };

  return EstablishmentJobs;
};

/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerJobs = sequelize.define(
    'workerJobs',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      workerFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerFK"',
      },
      jobFk: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"JobFK"',
      },
      other: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Other"',
      },
    },
    {
      tableName: 'WorkerJobs',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  WorkerJobs.associate = (models) => {
    WorkerJobs.belongsTo(models.job, {
      foreignKey: 'jobFk',
      targetKey: 'id',
      as: 'reference',
    });
  };

  return WorkerJobs;
};

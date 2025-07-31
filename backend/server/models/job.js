/* jshint indent: 2 */

const { timeStamp } = require('console');

module.exports = function (sequelize, DataTypes) {
  const Job = sequelize.define(
    'job',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: '"JobID"',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"JobName"',
      },
      other: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: '"Other"',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"DeletedAt"',
      },
      jobRoleGroup: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: [
          'Care providing roles',
          'Professional and related roles',
          'Managerial and supervisory roles',
          'IT, digital and data roles',
          'Other roles',
        ],
        field: 'JobRoleGroup',
      },
      canDoDelegatedHealthcareActivities: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'CanDoDelegatedHealthcareActivities',
      },
    },
    {
      tableName: '"Job"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: 'DeletedAt',
      timestamps: true,
    },
  );

  Job.associate = (models) => {
    Job.hasMany(models.MandatoryTraining, {
      foreignKey: 'jobFK',
      sourceKey: 'id',
      as: 'MandatoryTraining',
    });
  };

  return Job;
};

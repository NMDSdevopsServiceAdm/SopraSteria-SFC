/* jshint indent: 2 */

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
    },
    {
      tableName: '"Job"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return Job;
};

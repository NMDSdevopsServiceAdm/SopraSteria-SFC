/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerLeaveReasons = sequelize.define(
    'workerLeaveReasons',
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
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Reason"',
      },
    },
    {
      tableName: 'WorkerLeaveReasons',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return WorkerLeaveReasons;
};

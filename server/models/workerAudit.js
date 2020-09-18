module.exports = function (sequelize, DataTypes) {
  const WorkerAudit = sequelize.define(
    'workerAudit',
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
      username: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Username"',
      },
      when: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: '"When"',
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['created', 'updated', 'saved', 'changed', 'wdfEligible'],
        field: '"EventType"',
      },
      property: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"PropertyName"',
      },
      event: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: '"ChangeEvents"',
      },
    },
    {
      tableName: '"WorkerAudit"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false, // intentionally keeping these false; updated timestamp will be managed within the Worker business model not this DB model
    },
  );

  return WorkerAudit;
};

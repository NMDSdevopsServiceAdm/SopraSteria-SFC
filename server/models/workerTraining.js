/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerTraining = sequelize.define(
    'workerTraining',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      uid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: '"UID"',
      },
      workerFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"WorkerFK"',
      },
      source: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Online', 'Bulk'],
        default: 'Online',
        field: '"DataSource"',
      },
      categoryFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"CategoryFK"',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Title"',
      },
      accredited: {
        type: DataTypes.ENUM,
        values: ['Yes', 'No', "Don't know"],
        allowNull: true,
        field: '"Accredited"',
      },
      completed: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Completed"',
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: '"Expires"',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Notes"',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'updatedby',
      },
    },
    {
      tableName: 'WorkerTraining',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  WorkerTraining.associate = (models) => {
    WorkerTraining.belongsTo(models.worker, {
      foreignKey: 'workerFk',
      targetKey: 'id',
      as: 'worker',
    });
    WorkerTraining.belongsTo(models.workerTrainingCategories, {
      foreignKey: 'categoryFk',
      targetKey: 'id',
      as: 'category',
    });
  };

  return WorkerTraining;
};

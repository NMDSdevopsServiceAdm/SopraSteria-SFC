/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerNurseFieldsOfPractice = sequelize.define(
    'workerNurseFieldsOfPractice',
    {
      workerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'WorkerID',
        references: {
          model: {
            tableName: 'Worker',
            schema: 'cqc',
          },
          key: 'id',
        },
      },

      // alias to allow Worker class save() method to work
      workerFk: {
        type: DataTypes.INTEGER,
        field: 'WorkerID',
      },

      nurseFieldOfPracticeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'NurseFieldOfPracticeID',
        references: {
          model: {
            tableName: 'NurseFieldOfPractice',
            schema: 'cqc',
          },
          key: 'id',
        },
      },
    },
    {
      tableName: 'WorkerNurseFieldsOfPractice',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  WorkerNurseFieldsOfPractice.associate = (models) => {
    WorkerNurseFieldsOfPractice.belongsTo(models.worker, {
      foreignKey: 'workerID',
      targetKey: 'id',
    });
    WorkerNurseFieldsOfPractice.belongsTo(models.nurseFieldOfPractice, {
      foreignKey: 'nurseFieldOfPracticeID',
      targetKey: 'id',
    });
  };

  return WorkerNurseFieldsOfPractice;
};

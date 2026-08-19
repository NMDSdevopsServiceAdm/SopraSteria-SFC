/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const WorkerNurseFieldsOfPractice = sequelize.define(
    'WorkerNurseFieldsOfPractice',
    {
      WorkerID: {
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
      NurseFieldOfPracticeID: {
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
      foreignKey: 'WorkerID',
      targetKey: 'id',
    });
    WorkerNurseFieldsOfPractice.belongsTo(models.NurseFieldOfPractice, {
      foreignKey: 'NurseFieldOfPracticeID',
      targetKey: 'id',
    });
  };

  return WorkerNurseFieldsOfPractice;
};

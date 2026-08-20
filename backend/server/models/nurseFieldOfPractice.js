module.exports = function (sequelize, DataTypes) {
  const NurseFieldOfPractice = sequelize.define(
    'NurseFieldOfPractice',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      seq: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'Seq',
      },
      label: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Label',
      },
      analysisFileCode: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'AnalysisFileCode',
      },
      bulkUploadCode: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'BulkUploadCode',
      },
    },
    {
      tableName: 'NurseFieldOfPractice',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,

      defaultScope: {
        attributes: ['id', 'label'],
        order: [['seq', 'ASC']],
      },
    },
  );

  NurseFieldOfPractice.associate = (models) => {
    NurseFieldOfPractice.belongsToMany(models.worker, {
      through: 'WorkerNurseFieldsOfPractice',
      foreignKey: 'nurseFieldOfPracticeID',
      sourceKey: 'id',
      as: 'workers',
    });
  };

  NurseFieldOfPractice.addScope('bulkUpload', {
    attributes: ['id', 'bulkUploadCode', 'label'],
  });

  return NurseFieldOfPractice;
};

const { QueryTypes } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const MandatoryTraining = sequelize.define(
    'MandatoryTraining',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"ID"',
      },
      establishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentFK"',
      },
      trainingCategoryFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"TrainingCategoryFK"',
      },
      jobFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"JobFK"',
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
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: '"CreatedByUserUID"',
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: '"UpdatedByUserUID"',
      },
    },
    {
      tableName: 'MandatoryTraining',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  MandatoryTraining.associate = (models) => {
    MandatoryTraining.belongsTo(models.establishment, {
      foreignKey: 'establishmentFK',
      targetKey: 'id',
      as: 'establishment',
    });
    MandatoryTraining.belongsTo(models.workerTrainingCategories, {
      foreignKey: 'trainingCategoryFK',
      targetKey: 'id',
      as: 'workerTrainingCategories',
    });
    MandatoryTraining.belongsTo(models.job, {
      foreignKey: 'jobFK',
      targetKey: 'id',
      as: 'job',
    });
  };

  MandatoryTraining.checkIfTrainingCategoryIsMandatory = async function (establishmentId, trainingCategoryId) {
    return await this.findAll({
      where: {
        establishmentFK: establishmentId,
        trainingCategoryFK: trainingCategoryId,
      },
    });
  };

  MandatoryTraining.getWorkersWithMandatoryTraining = async function(establishmentId, trainingCategoryId) {

    const result = await sequelize.query(`
        SELECT w."ID" AS "WorkerId", w."WorkerUID" AS "WorkerUid", w."NameOrIdValue" AS "NameOrIdValue", j."JobName" AS "JobName", j."JobID" AS "JobFK", mt."ID" AS "MandatoryTrainingId", w."EstablishmentFK" AS "EstablishmentFK1", mt."TrainingCategoryFK", mt."JobFK"
        FROM cqc."MandatoryTraining" mt
        RIGHT OUTER JOIN cqc."Worker" w ON mt."EstablishmentFK" = w."EstablishmentFK" AND mt."JobFK" = w."MainJobFKValue"
        LEFT OUTER JOIN cqc."Job" j ON w."MainJobFKValue" = j."JobID"
        WHERE w."EstablishmentFK" = ${establishmentId} AND "TrainingCategoryFK" = ${trainingCategoryId}
      `, { type: QueryTypes.SELECT});

    const response = result.map(x => ({
      worker: {
        id: x.WorkerId,
        uid: x.WorkerUid,
        NameOrIdValue: x.NameOrIdValue,
        mainJob: {
          id: x.JobFK,
          title: x.JobName
        },
      }
    }));

    return response;
  }

  return MandatoryTraining;
};

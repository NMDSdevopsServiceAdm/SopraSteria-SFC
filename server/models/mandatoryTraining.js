module.exports = function(sequelize, DataTypes) {
  const MandatoryTraining =  sequelize.define('MandatoryTraining', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"ID"'
    },
    establishmentFK : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"EstablishmentFK"'
    },
    trainingCategoryFK : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"TrainingCategoryFK"'
    },
    jobFK : {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"JobFK"'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created'
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: '"CreatedByUserUID"'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: '"UpdatedByUserUID"'
    },
  }, {
    tableName: 'MandatoryTraining',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  MandatoryTraining.associate = (models) => {
    MandatoryTraining.belongsTo(models.establishment, {
      foreignKey: 'establishmentFK',
      targetKey: 'id',
      as: 'establishment'
    });
    MandatoryTraining.belongsTo(models.workerTrainingCategories, {
      foreignKey: 'trainingCategoryFK',
      targetKey: 'id',
      as: 'workerTrainingCategories'
    });
    MandatoryTraining.belongsTo(models.job, {
      foreignKey: 'jobFK',
      targetKey: 'id',
      as: 'job'
    });
  };

  return MandatoryTraining;
};

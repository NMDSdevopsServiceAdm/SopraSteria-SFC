/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Categories = sequelize.define(
    'workerTrainingCategories',
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
      category: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Category"',
      },
      trainingCategoryGroup: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: [
          'Care skills and knowledge',
          'Health and safety in the workplace',
          'IT, digital and data in the workplace',
          'Specific conditions and disabilities',
          'Staff development'
        ],
        field: 'TrainingCategoryGroup',
      }
    },
    {
      tableName: 'TrainingCategories',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  Categories.findAllWithMandatoryTraining = function (establishmentId) {
    return this.findAll({
      include: [
        {
          model: sequelize.models.MandatoryTraining,
          as: 'MandatoryTraining',
          where: {
            EstablishmentFK: establishmentId,
          },
          required: false,
        },
      ],
    });
  };

  Categories.associate = (models) => {
    Categories.hasMany(models.MandatoryTraining, {
      foreignKey: 'TrainingCategoryFK',
      sourceKey: 'id',
      as: 'MandatoryTraining',
    });
    Categories.hasMany(models.workerTraining, {
      foreignKey: 'categoryFk',
      sourceKey: 'id',
      as: 'workerTraining',
    });
  };

  return Categories;
};

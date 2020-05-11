/* jshint indent: 2 */

const models = require('../models/index');

module.exports = function(sequelize, DataTypes) {
  const Categories =  sequelize.define('workerTrainingCategories', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
      field: '"ID"'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'Seq'
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Category"'
    },
  }, {
    tableName: 'TrainingCategories',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  Categories.associate = (models) => {
    Categories.hasMany(models.MandatoryTraining, {
      foreignKey: 'TrainingCategoryFK',
      sourceKey: 'id',
      as: 'MandatoryTraining',
    });
  };

  return Categories;
};

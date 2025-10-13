const { Enum } = require('../../reference/databaseEnumTypes');

module.exports = function (sequelize, DataTypes) {
  const TrainingCourse = sequelize.define(
    'TrainingCourse',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      establishmentFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'EstablishmentFK',
      },
      categoryFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'CategoryFK',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Name',
      },
      accredited: {
        type: DataTypes.ENUM(Enum.YesNoDontKnow),
        allowNull: true,
        field: 'Accredited',
      },
      deliveredBy: {
        type: DataTypes.ENUM(Enum.TrainingCourseDeliveredBy),
        allowNull: true,
        field: 'DeliveredBy',
      },
      externalProviderName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ExternalProviderName',
      },
      howWasItDelivered: {
        type: DataTypes.ENUM(Enum.TrainingCourseDeliveryMode),
        allowNull: true,
        field: 'HowWasItDelivered',
      },
      doesNotExpire: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'DoesNotExpire',
      },
      validityPeriodInMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ValidityPeriodInMonth',
      },
      created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created',
      },
      updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated',
      },
      createdBy: {
        type: DataTypes.TEXT,
        field: 'createdBy',
      },
      updatedBy: {
        type: DataTypes.TEXT,
        field: 'updatedBy',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'archived',
      },
    },
    {
      tableName: 'TrainingCourse',
      schema: 'cqc',
      createdAt: 'created',
      updatedAt: 'updated',
    },
  );

  TrainingCourse.associate = (models) => {
    TrainingCourse.belongsTo(models.establishment, {
      foreignKey: 'establishmentFk',
      targetKey: 'id',
      as: 'establishment',
    });

    TrainingCourse.belongsTo(models.workerTrainingCategories, {
      foreignKey: 'categoryFk',
      targetKey: 'id',
      as: 'category',
    });
  };

  return TrainingCourse;
};

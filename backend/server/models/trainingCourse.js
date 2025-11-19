const { Enum } = require('../../reference/databaseEnumTypes');
const { ensureProviderInfoCorrect } = require('./hooks/trainingHooks');

module.exports = function (sequelize, DataTypes) {
  const TrainingCourse = sequelize.define(
    'trainingCourse',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        field: 'UID',
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
        validate: { isIn: [Enum.YesNoDontKnow] },
      },
      deliveredBy: {
        type: DataTypes.ENUM(Enum.TrainingCourseDeliveredBy),
        allowNull: true,
        field: 'DeliveredBy',
        validate: {
          isIn: [Enum.TrainingCourseDeliveredBy],
        },
      },
      trainingProviderFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TrainingProviderFK',
      },
      otherTrainingProviderName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'OtherTrainingProviderName',
      },

      // Temporary field to match the current frontend interface. to be removed in ticket #1840
      externalProviderName: {
        type: DataTypes.VIRTUAL,
        allowNull: true,
        get() {
          return this.otherTrainingProviderName;
        },
        set(externalProviderName) {
          if (externalProviderName?.length > 0) {
            this.trainingProviderFk = 63;
            this.otherTrainingProviderName = externalProviderName;
          }
        },
      },

      howWasItDelivered: {
        type: DataTypes.ENUM(Enum.TrainingCourseDeliveryMode),
        allowNull: true,
        field: 'HowWasItDelivered',
        validate: { isIn: [Enum.TrainingCourseDeliveryMode] },
      },
      doesNotExpire: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'DoesNotExpire',
        validate: {
          clearValidityPeriod() {
            if (this.doesNotExpire === true) {
              this.validityPeriodInMonth = null;
            }
          },
        },
        set(value) {
          this.setDataValue('doesNotExpire', Boolean(value));
        },
      },
      validityPeriodInMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ValidityPeriodInMonth',
        validate: { min: 1 },
      },
      created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdBy: {
        type: DataTypes.TEXT,
      },
      updatedBy: {
        type: DataTypes.TEXT,
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'TrainingCourse',
      schema: 'cqc',
      createdAt: 'created',
      updatedAt: 'updated',

      defaultScope: {
        include: ['category', 'trainingProvider'],
        nest: true,
      },
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

    TrainingCourse.hasMany(models.workerTraining, {
      foreignKey: 'trainingCourseFK',
      targetKey: 'id',
      as: 'workerTraining',
    });

    TrainingCourse.belongsTo(models.trainingProvider, {
      foreignKey: 'trainingProviderFk',
      targetKey: 'id',
      as: 'trainingProvider',
    });
  };

  TrainingCourse.addHook('beforeSave', 'ensureProviderInfoCorrect', ensureProviderInfoCorrect);

  return TrainingCourse;
};

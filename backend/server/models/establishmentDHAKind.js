/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentDHActivities = sequelize.define(
    'EstablishmentDHActivities',
    {
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'EstablishmentID',
        references: {
          model: {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          key: 'id',
        },
      },
      delegatedHealthcareActivitiesID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'DelegatedHealthcareActivitiesID',
        references: {
          model: {
            tableName: 'DelegatedHealthcareActivities',
            schema: 'cqc',
          },
          key: 'id',
        },
      },
    },
    {
      tableName: 'EstablishmentDHActivities',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentDHActivities.associate = (models) => {
    EstablishmentDHActivities.belongsTo(models.establishment, {
      foreignKey: 'establishmentId',
      targetKey: 'id',
    });

    EstablishmentDHActivities.belongsTo(models.delegatedHealthcareActivities, {
      foreignKey: 'DelegatedHealthcareActivitiesID',
      targetKey: 'id',
    });
  };

  return EstablishmentDHActivities;
};

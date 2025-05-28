/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentCWPReason = sequelize.define(
    'EstablishmentCWPReason',
    {
      establishmentID: {
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
      careWorkforcePathwayReasonID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'CareWorkforcePathwayReasonID',
        references: {
          model: {
            tableName: 'CareWorkforcePathwayReasons',
            schema: 'cqc',
          },
          key: 'id',
        },
      },
      other: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Other',
      },
    },
    {
      tableName: 'EstablishmentCWPReason',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentCWPReason.associate = (models) => {
    EstablishmentCWPReason.belongsTo(models.establishment, {
      foreignKey: 'establishmentID',
      targetKey: 'id',
    });
    EstablishmentCWPReason.belongsTo(models.CareWorkforcePathwayReasons, {
      foreignKey: 'careWorkforcePathwayReasonID',
      targetKey: 'id',
    });
  };

  return EstablishmentCWPReason;
};

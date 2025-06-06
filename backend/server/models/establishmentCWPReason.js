/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentCWPReasons = sequelize.define(
    'EstablishmentCWPReasons',
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
      tableName: 'EstablishmentCWPReasons',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentCWPReasons.associate = (models) => {
    EstablishmentCWPReasons.belongsTo(models.establishment, {
      foreignKey: 'establishmentId',
      targetKey: 'id',
    });
    EstablishmentCWPReasons.belongsTo(models.CareWorkforcePathwayReasons, {
      foreignKey: 'careWorkforcePathwayReasonID',
      targetKey: 'id',
    });
  };

  return EstablishmentCWPReasons;
};

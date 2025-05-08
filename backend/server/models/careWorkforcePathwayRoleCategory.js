/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const careWorkforcePathwayRoleCategory = sequelize.define(
    'careWorkforcePathwayRoleCategory',
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
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Title"',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"Description"',
      },
    },
    {
      tableName: 'CareWorkforcePathwayRoleCategories',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return careWorkforcePathwayRoleCategory;
};

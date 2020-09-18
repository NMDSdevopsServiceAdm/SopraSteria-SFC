/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const recruitedFrom = sequelize.define(
    'recruitedFrom',
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
      from: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: '"From"',
      },
    },
    {
      tableName: 'RecruitedFrom',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  return recruitedFrom;
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const OtherWorkplaces =  sequelize.define('otherWorkplaces', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: '"EstablishmentID"'
    },
    name: {
      type: DataTypes.TEXT,
      field: '"NameValue"'
    },
    parentId: {
      type: DataTypes.TEXT,
      field: '"ParentID"'
    },
    showFlag: {
      type: DataTypes.BOOLEAN,
      field: '"ShowFlag"'
    }
  }, {
    tableName: 'OtherWorkplaces',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  return OtherWorkplaces;
};

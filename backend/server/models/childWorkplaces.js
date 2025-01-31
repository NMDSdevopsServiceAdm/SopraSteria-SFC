/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChildWorkplaces =  sequelize.define('childWorkplaces', {
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
    tableName: 'ChildWorkplaces',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  ChildWorkplaces.associate = (models) => {
    ChildWorkplaces.belongsTo(models.establishment, {
      as: 'establishment',
      foreignKey: 'id',
      targetKey: 'id',
    });
  };

  ChildWorkplaces.findOneWithNeedsAttentionFlag = async function (establishmentId) {
    return await ChildWorkplaces.findOne({
          attributes: [
            'showFlag'
          ],
          where: {
            parentId: establishmentId,
            showFlag: 'true'
          }
        });
  }

  return ChildWorkplaces;
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ServiceUsers =  sequelize.define('serviceUsers', {
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
    group: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"ServiceGroup"'
    },
    service: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Service"'
    }
  }, {
    tableName: 'ServiceUsers',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
/*
  ServiceUsers.associate = (models) => {
    ServiceUsers.belongsToMany(models.establishment, {
      through: 'establishmentServiceUsers',
      foreignKey: 'ServiceUserID',
      targetKey: 'id',
      as: 'establishments'
    });
  };
*/    
  return ServiceUsers;
};

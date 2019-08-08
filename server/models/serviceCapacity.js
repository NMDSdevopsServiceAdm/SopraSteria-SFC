/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ServiceCapacity = sequelize.define('serviceCapacity', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: '"ServiceCapacityID"'
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"ServiceID"'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: '"Sequence"'
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Question"'
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['Capacity', 'Utilisation'],
      default: 'Capacity',
      field: '"Type"'
    },
  }, {
    tableName: '"ServicesCapacity"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  ServiceCapacity.associate = (models) => {
    ServiceCapacity.belongsTo(models.services, {
      foreignKey: 'serviceId',
      targetKey: 'id',
      as: 'service'
    });
  };

  return ServiceCapacity;
};

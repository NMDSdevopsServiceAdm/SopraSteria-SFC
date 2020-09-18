/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const EstablishmentCapacity = sequelize.define(
    'establishmentCapacity',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: '"EstablishmentCapacityID"',
      },
      serviceCapacityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"ServiceCapacityID"',
      },
      establishmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"EstablishmentID"',
      },
      answer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"Answer"',
      },
    },
    {
      tableName: '"EstablishmentCapacity"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  EstablishmentCapacity.associate = (models) => {
    // EstablishmentCapacity.hasOne(models.serviceCapacity, {
    //   foreignKey: 'id',
    //   targetKey: 'serviceCapacityId',
    //   sourceKey: 'id',
    //   as: 'reference'
    // });
    EstablishmentCapacity.belongsTo(models.serviceCapacity, {
      foreignKey: 'serviceCapacityId',
      targetKey: 'id',
      as: 'reference',
    });
  };

  return EstablishmentCapacity;
};

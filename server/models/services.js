/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  const Services = sequelize.define(
    'services',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      iscqcregistered: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      isMain: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'ismain',
      },
      other: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        default: false,
        field: '"other"',
      },
    },
    {
      tableName: 'services',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );
  Services.findNameByID = function (id) {
    return this.findOne({
      where: {
        id: id,
      },
      attributes: ['name'],
    });
  };
  Services.associate = (models) => {
    Services.belongsToMany(models.establishment, {
      through: 'establishmentServices',
      foreignKey: 'serviceId',
      targetKey: 'id',
      as: 'establishments',
    });
  };

  return Services;
};

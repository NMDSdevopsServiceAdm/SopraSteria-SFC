/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Establishment = sequelize.define('establishment', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"EstablishmentID"'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: '"Name"'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"Address"'
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"LocationID"'
    },
    postcode: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: '"PostCode"'
    },
    isRegulated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: '"IsRegulated"'
    },
    mainServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"MainServiceId"'
    },
    employerType: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['Private Section', 'Voluntary / Charity', 'Other'],
      field: '"EmployerType"'
    }
  }, {
    tableName: '"Establishment"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });

  Establishment.associate = (models) => {
    Establishment.belongsTo(models.services, {
      foreignKey: 'mainServiceId',
      targetKey: 'id',
      as: 'mainService'
    })
  };

  return Establishment;
};

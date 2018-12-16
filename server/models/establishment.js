/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('establishment', {
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"EstablishmentID"'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
      field: '"Name"'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Address"'
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"LocationID"'
    },
    postcode: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: '"Postcode"'
    },
    isRegulated: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: '"IsRegulated"'
    },
    mainServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: '"MainServiceId"'
    }
  }, {
    tableName: '"Establishment"',
    schema: 'cqc',
    createdAt: false,
    updatedAt: false
  });
};

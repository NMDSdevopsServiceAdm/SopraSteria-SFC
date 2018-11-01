'use strict';
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    locationId: DataTypes.STRING,
    name: DataTypes.STRING,
    postalCode: DataTypes.STRING
  }, {});
  Location.associate = function(models) {
    // associations can be defined here
  };
  return Location;
};
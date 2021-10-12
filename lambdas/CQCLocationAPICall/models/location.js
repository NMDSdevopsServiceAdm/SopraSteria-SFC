'use strict';
module.exports = (sequelize, DataTypes) => {
  const location = sequelize.define('location', {
    locationname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    addressline1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    addressline2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    towncity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    county: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    postalcode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mainservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    locationid: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    }
  }, {
    schema: 'cqcref',
    createdAt: 'createdat',
    updatedAt: 'updatedat',
    freezeTableName: true
  });
  location.associate = function(models) {
    // associations can be defined here
  };
  location.removeAttribute('id');
  return location;
};

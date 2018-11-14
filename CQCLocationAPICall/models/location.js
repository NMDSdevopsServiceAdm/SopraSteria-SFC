'use strict';
module.exports = (sequelize, DataTypes) => {
  const location = sequelize.define('location', {
    cqcid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    locationname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    postalcod: {
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
    schema: 'cqc',
    createdAt: 'createdat',
    updatedAt: 'updatedat',
    freezeTableName: true
  });
  location.associate = function(models) {
    // associations can be defined here
  };
  return location;
};

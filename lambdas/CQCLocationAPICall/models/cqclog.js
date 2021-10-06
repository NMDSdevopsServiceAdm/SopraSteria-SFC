'use strict';
module.exports = (sequelize, DataTypes) => {
  const cqclog = sequelize.define('cqclog', {
    success: DataTypes.BOOLEAN,
    message: DataTypes.STRING,
    lastUpdatedAt: DataTypes.STRING
  }, {
    schema: 'cqc',
    tableName: 'CqcLog',
    createdAt: 'createdat',
    updatedAt: false,
    freezeTableName: true
  });
  cqclog.associate = function(models) {
    // associations can be defined here
  };
  return cqclog;
};

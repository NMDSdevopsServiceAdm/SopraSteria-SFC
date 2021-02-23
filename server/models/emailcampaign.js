'use strict';
module.exports = (sequelize, DataTypes) => {
  const EmailCampaign = sequelize.define('EmailCampaign', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"id"',
    },
    userId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {});

  EmailCampaign.associate = function(models) {
    EmailCampaign.belongsTo(models.user, {
      foreignKey : 'userId',
      targetKey: 'id',
    });
  };

  return EmailCampaign;
};

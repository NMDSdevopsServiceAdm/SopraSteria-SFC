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
    userID: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    schema: 'cqc'
  });

  EmailCampaign.associate = function(models) {
    EmailCampaign.belongsTo(models.user, {
      foreignKey : 'userID',
      targetKey: 'id',
    });

    EmailCampaign.hasMany(models.EmailCampaignHistory, {
      foreignKey: 'emailCampaignID',
      sourceKey: 'id',
      as: 'emailCampaignHistories',
    });
  };

  return EmailCampaign;
};

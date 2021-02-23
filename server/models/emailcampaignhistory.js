'use strict';
module.exports = (sequelize, DataTypes) => {
  const EmailCampaignHistory = sequelize.define('EmailCampaignHistory', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: '"id"',
    },
    emailCampaignID: DataTypes.INTEGER,
    establishmentID: DataTypes.INTEGER,
    dataOwner: DataTypes.STRING,
    lastUpdated: DataTypes.DATE,
    template: DataTypes.STRING,
    sentToName: DataTypes.STRING,
    sentToEmail: DataTypes.STRING
  });

  EmailCampaignHistory.associate = function(models) {
    EmailCampaignHistory.belongsTo(models.establishment, {
      foreignKey : 'establishmentID',
      targetKey: 'id',
    });

    EmailCampaignHistory.belongsTo(models.EmailCampaign, {
      foreignKey : 'emailCampaignID',
      targetKey: 'id',
    });
  };

  return EmailCampaignHistory;
};

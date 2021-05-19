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
    template: DataTypes.STRING,
    data: DataTypes.JSONB,
    sentToName: DataTypes.STRING,
    sentToEmail: DataTypes.STRING,
  }, {
    schema: 'cqc'
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

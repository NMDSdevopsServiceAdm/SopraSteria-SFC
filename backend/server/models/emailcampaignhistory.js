'use strict';
const { Op } = require('sequelize');
const dayjs = require('dayjs');

module.exports = (sequelize, DataTypes) => {
  const EmailCampaignHistory = sequelize.define(
    'EmailCampaignHistory',
    {
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
      createdAt: DataTypes.DATE,
    },
    {
      schema: 'cqc',
    },
  );

  EmailCampaignHistory.associate = function (models) {
    EmailCampaignHistory.belongsTo(models.establishment, {
      foreignKey: 'establishmentID',
      targetKey: 'id',
    });

    EmailCampaignHistory.belongsTo(models.EmailCampaign, {
      foreignKey: 'emailCampaignID',
      targetKey: 'id',
    });
  };

  EmailCampaignHistory.countToday = async function () {
    const today = dayjs().format('YYYY-MM-DDT00:00:00');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DDT00:00:00');

    return this.count({
      where: {
        createdAt: {
          [Op.gt]: today,
          [Op.lt]: tomorrow,
        },
      },
    });
  };

  return EmailCampaignHistory;
};

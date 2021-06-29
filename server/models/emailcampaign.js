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
    type: DataTypes.STRING,
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

  EmailCampaign.getHistory = async function (type) {
    return this.findAll({
      attributes: [
        'createdAt',
        [
          sequelize.fn('COUNT', sequelize.col('"emailCampaignHistories"."id"')), 'emails'
        ],
      ],
      where: {
        type,
      },
      include: [{
        model: sequelize.models.EmailCampaignHistory,
        attributes: [],
        as: 'emailCampaignHistories',
      }],
      group: [
        'EmailCampaign.id',
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
    });
  }

  EmailCampaign.types = () => {
    return {
      INACTIVE_WORKPLACES: 'inactiveWorkplaces',
      TARGETED_EMAILS: 'targetedEmails'
    }
  }

  return EmailCampaign;
};

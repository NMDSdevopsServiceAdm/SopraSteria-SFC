'use strict';

module.exports = function (sequelize, DataTypes) {
  const DevelopmentFundGrants = sequelize.define(
    'DevelopmentFundGrants',
    {
      AgreementID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      EstablishmentID: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          key: 'EstablishmentID',
        },
        unique: true,
      },
      SignStatus: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      Receiver: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      DateSent: {
        type: DataTypes.DATE,
        allowNull: false,
        default: sequelize.NOW,
      },
      DateCompleted: {
        type: DataTypes.DATE,
        allowNull: true,
        default: null,
      },
    },
    {
      tableName: 'DevelopmentFundGrants',
      createdAt: false,
      updatedAt: false,
    },
  );

  return DevelopmentFundGrants;
};

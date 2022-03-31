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
        type: DataTypes.ENUM,
        allowNull: false,
        default: 'SENT',
        values: ['SENT', 'COMPLETED', 'CANCELLED'],
      },
      ReceiverEmail: {
        type: DataTypes.STRING(320),
        allowNull: false,
      },
      ReceiverName: {
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
      schema: 'cqc',
    },
  );

  DevelopmentFundGrants.saveWDFData = function (data) {
    return this.create({
      AgreementID: data.agreementId,
      EstablishmentID: data.establishmentId,
      ReceiverEmail: data.email,
      ReceiverName: data.name,
      SignStatus: data.signStatus,
      DateSent: data.createdDate,
    });
  };

  return DevelopmentFundGrants;
};

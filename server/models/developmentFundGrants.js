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
      },
      SignStatus: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          'OUT_FOR_SIGNATURE',
          'OUT_FOR_DELIVERY',
          'OUT_FOR_ACCEPTANCE',
          'OUT_FOR_FORM_FILLING',
          'OUT_FOR_APPROVAL',
          'AUTHORING',
          'CANCELLED',
          'SIGNED',
          'APPROVED',
          'DELIVERED',
          'ACCEPTED',
          'FORM_FILLED',
          'EXPIRED',
          'ARCHIVED',
          'PREFILL',
          'WIDGET_WAITING_FOR_VERIFICATION',
          'DRAFT',
          'DOCUMENTS_NOT_YET_PROCESSED',
          'WAITING_FOR_FAXIN',
          'WAITING_FOR_VERIFICATION',
          'WAITING_FOR_NOTARIZATION',
        ],
      },
      ReceiverEmail: {
        type: DataTypes.STRING(320),
        allowNull: false,
      },
      ReceiverName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      DateCreated: {
        type: DataTypes.DATE,
        allowNull: false,
        default: sequelize.NOW,
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
      DateCreated: data.createdDate,
    });
  };

  return DevelopmentFundGrants;
};

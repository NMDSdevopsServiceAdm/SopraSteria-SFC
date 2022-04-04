'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'DevelopmentFundGrants',
      {
        AgreementID: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
        EstablishmentID: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        SignStatus: {
          type: Sequelize.ENUM,
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
          type: Sequelize.STRING(320),
          allowNull: false,
        },
        ReceiverName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        DateCreated: {
          type: Sequelize.DATE,
          allowNull: false,
          default: Sequelize.NOW,
        },
      },
      {
        schema: 'cqc',
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: 'DevelopmentFundGrants',
      schema: 'cqc',
    });

    return queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_DevelopmentFundGrants_SignStatus";');
  },
};

'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          ' \
          UPDATE cqc."Establishment" \
          SET "CssrID" = cssr."CssrID" \
          FROM cqcref.pcodedata pcd \
          JOIN cqc."Cssr" cssr ON pcd.local_custodian_code = cssr."LocalCustodianCode" \
          WHERE cqc."Establishment"."PostCode" = pcd.postcode;',
          {
            transaction,
          },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {

  },
};

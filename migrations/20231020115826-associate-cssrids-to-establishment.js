'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.query(
      ' \
      UPDATE cqc."Establishment" \
      SET "CssrID" = cssr."CssrID" \
      FROM cqcref.pcodedata pcd \
      JOIN cqc."Cssr" cssr ON pcd.local_custodian_code = cssr."LocalCustodianCode" \
      WHERE cqc."Establishment"."PostCode" = pcd.postcode;',
    );
  },
};

'use strict';

//Fails on empty postcode record in pcodedata table

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    'UPDATE cqc."Establishment" e SET "CssrID" = cssr."CssrID" \
    FROM cqcref."pcodedata" pcd \
    INNER JOIN cqc."Cssr" cssr ON cssr."LocalCustodianCode" = pcd."local_custodian_code" \
    WHERE e."PostCode" LIKE substr(pcd."postcode", 1, length(pcd."postcode") - 1) || "%"';
  },

  async down (queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

// UPDATE cqc."Establishment" e SET "CssrID" = cssr."CssrID"
// FROM cqcref."pcodedata" pcd
// INNER JOIN cqc."Cssr" cssr ON cssr."LocalCustodianCode" = pcd."local_custodian_code"
// WHERE length(pcd."postcode") > 0 AND
// e."PostCode" LIKE substr(pcd."postcode", 1, length(pcd."postcode") - 1) || '%';
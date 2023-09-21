'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.query(
      'UPDATE cqc."Establishment" e SET "CssrID" = cssr."CssrID" \
      FROM cqcref."pcodedata" pcd INNER JOIN cqc."Cssr" cssr ON cssr."LocalCustodianCode" = pcd."local_custodian_code"\
      WHERE e."PostCode" = pcd."postcode";',
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};


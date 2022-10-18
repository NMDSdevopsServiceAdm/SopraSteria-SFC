'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
    INSERT INTO cqc."NotificationType"("Type", "Title")
    VALUES ('OWNERCHANGE', 'Change data owner'),
      ('LINKTOPARENTREQUEST', 'Link to parent organisation'),
    ('LINKTOPARENTAPPROVED', 'Link to parent organisation'),
    ('LINKTOPARENTREJECTED', 'Link to parent organisation'),
    ('DELINKTOPARENT', 'Remove link to parent organisation'),
    ('BECOMEAPARENT', 'Become a parent organisation')
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DELETE FROM cqc."NotificationType" WHERE "Type" IN ('OWNERCHANGE',
    'LINKTOPARENTREQUEST',
    'LINKTOPARENTAPPROVED',
    'LINKTOPARENTREJECTED',
    'DELINKTOPARENT',
    'BECOMEAPARENT')
    `);
  },
};

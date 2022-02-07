'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE cqc."User" ADD CONSTRAINT none_role_must_be_wdf_user CHECK ( NOT ("UserRoleValue" = \'None\' AND "CanManageWdfClaimsValue" = false) )',
    );
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.query('ALTER TABLE cqc."User" DROP CONSTRAINT none_role_must_be_wdf_user');
  },
};

'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query('ALTER TYPE cqc."user_role" ADD VALUE IF NOT EXISTS \'None\'');
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(`DELETE FROM pg_enum WHERE enumlabel = 'None'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')`);
  },
};

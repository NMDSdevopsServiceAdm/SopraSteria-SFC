'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE cqc."Establishment" ALTER COLUMN "OverallWdfEligibility" TYPE timestamp WITHOUT time zone',
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'ALTER TABLE cqc."Establishment" ALTER COLUMN "OverallWdfEligibility" TYPE timestamp with time zone  USING "OverallWdfEligibility" AT TIME ZONE \'GMT\'',
          { transaction },
        ),
      ]);
    });
  },
};

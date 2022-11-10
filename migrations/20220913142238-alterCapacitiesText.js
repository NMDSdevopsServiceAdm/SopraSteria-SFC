'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you have?\' where "ServiceCapacityID"=1;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are being used?\' where "ServiceCapacityID"=2;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you have?\' where "ServiceCapacityID"=3;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are being used?\' where "ServiceCapacityID"=4;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care at the moment\' where "ServiceCapacityID"=5;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you have?\' where "ServiceCapacityID"=6;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are being used?\' where "ServiceCapacityID"=7;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many places do you have at the moment?\' where "ServiceCapacityID"=8;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of those places that are being used\' where "ServiceCapacityID"=9;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many places do you have at the moment?\' where "ServiceCapacityID"=10;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of those places that are being used\' where "ServiceCapacityID"=11;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service at the moment\' where "ServiceCapacityID"=12;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care at the moment\' where "ServiceCapacityID"=13;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care at the moment\' where "ServiceCapacityID"=14;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care at the moment\' where "ServiceCapacityID"=15;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service at the moment\' where "ServiceCapacityID"=16;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care at the moment\' where "ServiceCapacityID"=17;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service at the moment\' where "ServiceCapacityID"=18;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of those places that are being used\', "Sequence"=2 where "ServiceCapacityID"=19;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'INSERT INTO cqc."ServicesCapacity" ("ServiceCapacityID", "ServiceID", "Question", "Sequence", "Type") VALUES(20, 19, \'How many places do you have at the moment?\', 1, \'Capacity\') ON CONFLICT ("ServiceCapacityID") DO UPDATE SET "Question"=\'How many places do you have at the moment?\'',
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you currently have?\' where "ServiceCapacityID"=1;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are currently used?\' where "ServiceCapacityID"=2;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you currently have?\' where "ServiceCapacityID"=3;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are currently used?\' where "ServiceCapacityID"=4;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=5;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many beds do you currently have?\' where "ServiceCapacityID"=6;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many of those beds are currently used?\' where "ServiceCapacityID"=7;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many places do you currently have?\' where "ServiceCapacityID"=8;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service on the completion date\' where "ServiceCapacityID"=9;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'How many places do you currently have?\' where "ServiceCapacityID"=10;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service on the completion date\' where "ServiceCapacityID"=11;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service on the completion date\' where "ServiceCapacityID"=12;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=13;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=14;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=15;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=16;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people receiving care on the completion date\' where "ServiceCapacityID"=17;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service on the completion date\' where "ServiceCapacityID"=18;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'update cqc."ServicesCapacity" set "Question"=\'Number of people using the service on the completion date\', "Sequence"=1 where "ServiceCapacityID"=19;',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'INSERT INTO cqc."ServicesCapacity" ("ServiceCapacityID", "ServiceID", "Question", "Sequence", "Type") VALUES(20, 19, \'How many places do you currently have?\', 2, \'Capacity\') ON CONFLICT ("ServiceCapacityID") DO UPDATE SET "Question"=\'How many places do you currently have?\'',
          { transaction },
        ),
      ]);
    });
  },
};

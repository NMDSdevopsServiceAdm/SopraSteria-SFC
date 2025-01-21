'use strict';
const models = require('../server/models/index');

const allReasons = [
  {
    id: 1,
    seq: 1,
    oldText: 'They moved to another adult social care employer',
    newText: 'The worker moved to another adult social care employer',
  },
  {
    id: 2,
    seq: 2,
    oldText: 'They moved to a role in the health sector',
    newText: 'The worker moved to a role in the health sector',
  },
  {
    id: 3,
    seq: 3,
    oldText: 'They moved to a different sector (e.g. retail)',
    newText: 'The worker moved to a different sector (for example, retail)',
  },
  {
    id: 4,
    seq: 4,
    oldText: 'They moved to another role in this organisation',
    newText: 'The worker moved to a different role in this organisation',
  },
  {
    id: 5,
    seq: 5,
    oldText: 'The worker chose to leave (destination unknown)',
    newText: 'The worker chose to leave (destination not known)',
  },
  { id: 6, seq: 6, oldText: 'The worker retired', newText: 'The worker retired' },
  {
    id: 7,
    seq: 7,
    oldText: 'Employer terminated their employment',
    newText: 'The worker had their employment terminated',
  },
  { id: 8, seq: 8, oldText: 'Other', newText: 'For a reason not listed' },
  { id: 9, seq: 9, oldText: 'Not known', newText: 'Reason not known' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const reason of allReasons) {
        await models.workerLeaveReasons.update(
          {
            reason: reason.newText,
          },
          {
            where: {
              id: reason.id,
            },
            transaction,
          },
        );
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const reason of allReasons) {
        await models.workerLeaveReasons.update(
          {
            reason: reason.oldText,
          },
          {
            where: {
              id: reason.id,
            },
            transaction,
          },
        );
      }
    });
  },
};

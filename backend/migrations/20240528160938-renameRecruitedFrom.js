'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.recruitedFrom.update(
        {
          from: 'Adult care sector: local authority',
        },
        {
          where: {
            id: 1,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: "Children's, young people's social care",
        },
        {
          where: {
            id: 4,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Other care sector',
        },
        {
          where: {
            id: 5,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Internal promotion, transfer or career development',
        },
        {
          where: {
            id: 6,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'First job role after education',
        },
        {
          where: {
            id: 9,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Other',
        },
        {
          where: {
            id: 10,
          },
        },
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.recruitedFrom.update(
        {
          from: 'Adult care sector: Local Authority',
        },
        {
          where: {
            id: 1,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: "Childrens/young people's social care",
        },
        {
          where: {
            id: 4,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Other sector',
        },
        {
          where: {
            id: 5,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Internal promotion or transfer or career development',
        },
        {
          where: {
            id: 6,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'First role after education',
        },
        {
          where: {
            id: 9,
          },
        },
        { transaction },
      );

      await models.recruitedFrom.update(
        {
          from: 'Other sources',
        },
        {
          where: {
            id: 10,
          },
        },
        { transaction },
      );
    });
  },
};

'use strict';
const models = require('../server/models/index');
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const newQuals = {
        "Award": [
          { id: 139, code: 316, title: "Epilepsy", level: '3' },
          { id: 140, code: 317, title: "TAQA assessment", level: '3' },
          { id: 141, code: 318, title: "TAQA internal quality assurance", level: '4' },
        ],
        "Certificate": [
          { id: 142, code: 319, title: "Falls prevention", level: '2' },
          { id: 143, code: 320, title: "Nutrition", level: 2 },
          { id: 144, code: 321, title: "Oral health", level: 2 },
        ],
        "Degree": [
          { id: 145, code: 322, title: "Occupational therapy degree", level: '6' },
          { id: 146, code: 323, title: "Physiotherapy degree", level: '6' },
          { id: 147, code: 324, title: "Any nursing degree", level: '6' },
        ],
        "Any other qualification": [
          { id: 148, code: 325, title: "Functional skills in english", level: '1' },
          { id: 149, code: 326, title: "Functional skills in english", level: '2' },
          { id: 150, code: 327, title: "Functional skills in maths", level: '1' },
          { id: 151, code: 328, title: "Functional skills in maths", level: '2' },
        ]
      }

      for (const key of Object.keys(newQuals)) {
        for (const row of newQuals[key]) {
          await models.workerAvailableQualifications.create(
            {
              id: row.id,
              title: row.title,
              code: row.code,
              group: key,
              level: row.level,
              analysisFileCode: `QL${row.code}ACHQ${row.level}`,
              seq: 0,
              multipleLevels: false,
              socialCareRelevant: false
            },
            { transaction },
          );
        }
      }
    })
  },

  async down (queryInterface, Sequelize) {
     return queryInterface.sequelize.transaction(async (transaction) => {
       await models.workerAvailableQualifications.destroy({
         where: {
           id: {
             [Op.gte]: 139,
             [Op.lte]: 151
           }
         }
       },
      { transaction },
     );
    });
  }
};

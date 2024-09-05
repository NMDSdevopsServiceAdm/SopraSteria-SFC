'use strict';
const models = require('../server/models/index');
const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const newQuals = {
        "Award": [
          { id: 139, code: 145, title: "Epilepsy", level: '3' },
          { id: 140, code: 146, title: "TAQA assessment", level: '3' },
          { id: 141, code: 147, title: "TAQA internal quality assurance", level: '4' },
        ],
        "Certificate": [
          { id: 142, code: 148, title: "Falls prevention", level: '2' },
          { id: 143, code: 149, title: "Nutrition", level: '2' },
          { id: 144, code: 150, title: "Oral health", level: '2' },
        ],
        "Degree": [
          { id: 145, code: 151, title: "Occupational therapy degree", level: '6' },
          { id: 146, code: 152, title: "Physiotherapy degree", level: '6' },
          { id: 147, code: 153, title: "Any nursing degree", level: '6' },
        ],
        "Any other qualification": [
          { id: 148, code: 154, title: "Functional skills in english", level: '1' },
          { id: 149, code: 155, title: "Functional skills in english", level: '2' },
          { id: 150, code: 156, title: "Functional skills in maths", level: '1' },
          { id: 151, code: 157, title: "Functional skills in maths", level: '2' },
        ]
      }

      for (const qualificationType of Object.keys(newQuals)) {
        for (const qualification of newQuals[qualificationType]) {
          await models.workerAvailableQualifications.create(
            {
              id: qualification.id,
              title: qualification.title,
              code: qualification.code,
              group: qualificationType,
              level: qualification.level,
              analysisFileCode: `QL${qualification.code}ACHQ${qualification.level}`,
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

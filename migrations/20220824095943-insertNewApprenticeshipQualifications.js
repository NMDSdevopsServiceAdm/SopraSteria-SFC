'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."Qualifications" ("ID", "Seq", "Group", "Title", "Code", "MultipleLevel", "RelevantToSocialCare", "AnalysisFileCode") VALUES
        (137, 1260, 'Apprenticeship', 'Think ahead', 314, false, false, 'QL314ACHQ'),
        (138, 1270, 'Apprenticeship', 'Social worker integrated Degree apprenticeship', 315, false, false, 'QL315ACHQ');`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM cqc."Qualifications" WHERE "ID"=137 OR "ID"=138;');
  },
};

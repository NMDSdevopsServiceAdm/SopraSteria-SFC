'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `INSERT INTO cqc."Qualifications" ("ID", "Seq", "Group", "Title", "Code","Level", "MultipleLevel", "RelevantToSocialCare", "AnalysisFileCode") VALUES
        (153, 0, 'Award', 'Understanding Digital Leadership in Adult Social Care', 159,5, false, false, 'QL159ACHQ5')`,
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM cqc."Qualifications" WHERE "ID"=153;');
  },
};

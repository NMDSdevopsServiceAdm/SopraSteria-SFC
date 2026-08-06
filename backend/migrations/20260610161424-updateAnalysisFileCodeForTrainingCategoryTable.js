'use strict';

const trainingCategories = [
  { AnalysisFileCode: 1, Category: 'Control and restraint' },
  { AnalysisFileCode: 2, Category: 'Dementia care' },
  { AnalysisFileCode: 5, Category: 'Emergency aid awareness' },
  { AnalysisFileCode: 6, Category: 'Fire safety' },
  { AnalysisFileCode: 7, Category: 'Basic life support and first aid' },
  { AnalysisFileCode: 8, Category: 'Food hygiene' },
  { AnalysisFileCode: 9, Category: 'Health and safety awareness' },
  { AnalysisFileCode: 10, Category: 'Infection prevention and control' },
  { AnalysisFileCode: 11, Category: 'Leadership and management' },
  { AnalysisFileCode: 12, Category: 'Learning disability' },
  { AnalysisFileCode: 13, Category: 'Medication management' },
  { AnalysisFileCode: 14, Category: 'Mental capacity and liberty safeguards' },
  { AnalysisFileCode: 15, Category: 'Assisting and moving people' },
  { AnalysisFileCode: 16, Category: 'Nutrition and hydration' },
  { AnalysisFileCode: 17, Category: 'Palliative, end of life care' },
  { AnalysisFileCode: 18, Category: 'Physical disability' },
  { AnalysisFileCode: 19, Category: 'Positive behaviour support and non-restrictive practice' },
  { AnalysisFileCode: 20, Category: 'Safeguarding adults' },
  { AnalysisFileCode: 21, Category: 'Other' },
  { AnalysisFileCode: 22, Category: 'Dignity, respect, person-centered care' },
  { AnalysisFileCode: 23, Category: 'Equality and diversity' },
  { AnalysisFileCode: 25, Category: "Children's, young people's related training" },
  { AnalysisFileCode: 26, Category: 'Data management and GDPR' },
  { AnalysisFileCode: 27, Category: 'Epilepsy' },
  { AnalysisFileCode: 28, Category: 'Communication' },
  { AnalysisFileCode: 29, Category: 'Diabetes' },
  { AnalysisFileCode: 30, Category: 'COSHH' },
  { AnalysisFileCode: 31, Category: 'Mental health' },
  { AnalysisFileCode: 32, Category: 'Autism' },
  { AnalysisFileCode: 33, Category: 'Continence care' },
  { AnalysisFileCode: 34, Category: 'Duty of care' },
  { AnalysisFileCode: 35, Category: 'Supervision, performance management' },
  { AnalysisFileCode: 36, Category: 'Stroke' },
  { AnalysisFileCode: 37, Category: 'Complaints handling, conflict resolution' },
  { AnalysisFileCode: 38, Category: 'Personal care' },
  { AnalysisFileCode: 39, Category: 'Activity provision, wellbeing' },
  { AnalysisFileCode: 40, Category: 'Sensory disability' },
  { AnalysisFileCode: 41, Category: 'Oliver McGowan Mandatory Training (elearning)' },
  { AnalysisFileCode: 42, Category: 'Oliver McGowan Mandatory Training (Tier 1)' },
  { AnalysisFileCode: 43, Category: 'Oliver McGowan Mandatory Training (Tier 2)' },
  { AnalysisFileCode: 44, Category: 'Oral health' },
  { AnalysisFileCode: 45, Category: 'Moving and handling objects' },
  { AnalysisFileCode: 46, Category: 'Assisted digital and accessibility' },
  { AnalysisFileCode: 47, Category: 'Digital leadership skills' },
  { AnalysisFileCode: 48, Category: 'In-house systems and applications' },
  { AnalysisFileCode: 49, Category: 'Online safety and security' },
  { AnalysisFileCode: 50, Category: 'Social media and communications' },
  { AnalysisFileCode: 51, Category: 'Working with digital technology' },
];

module.exports = {
  async up(queryInterface) {
    const caseStatement = trainingCategories
      .map(({ AnalysisFileCode, Category }) => `WHEN '${Category.replace(/'/g, "''")}' THEN ${AnalysisFileCode}`)
      .join('\n');

    return queryInterface.sequelize.query(`
      UPDATE cqc."TrainingCategories"
      SET "AnalysisFileCode" = CASE "Category"
        ${caseStatement}
      END
      WHERE "Category" IN (
        ${trainingCategories.map(({ Category }) => `'${Category.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."TrainingCategories"
      SET "AnalysisFileCode" = NULL
      WHERE "Category" IN (
        ${trainingCategories.map(({ Category }) => `'${Category.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },
};

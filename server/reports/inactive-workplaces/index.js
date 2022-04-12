const excelUtils = require('../../utils/excelUtils');

const findParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

const { generateInactiveWorkplacesTab } = require('./workplaces');
const { generateParentWorkplaceTab } = require('./parents');
const { generateSubsidaryWorkplaceTab } = require('./subsidiaries');
const { generateInactiveWorkplacesForDeletionTab } = require('./deleteInactiveWorkplace');

const generateInactiveWorkplacesReport = async (workbook) => {
  const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

  await generateInactiveWorkplacesTab(workbook);
  await generateParentWorkplaceTab(workbook, parentWorkplaces);
  await generateSubsidaryWorkplaceTab(workbook, parentWorkplaces);
  await generateInactiveWorkplacesForDeletionTab(workbook);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generateInactiveWorkplacesReport,
};

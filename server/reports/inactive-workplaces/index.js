const excelUtils = require('../../utils/excelUtils');

const setParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/setParentWorkplaces');

const { generateInactiveWorkplacesTab } = require('./workplaces');
const { generateParentWorkplaceTab } = require('./parents');
const { generateSubsidaryWorkplaceTab } = require('./subsidiaries');
const { generateInactiveWorkplacesForDeletionTab } = require('./deleteInactiveWorkplace');

const generateInactiveWorkplacesReport = async (workbook) => {
  const parentWorkplaces = await setParentWorkplaces.findParentWorkplaces();

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

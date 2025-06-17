const excelUtils = require('../../utils/excelUtils');
const inactiveWorkplacesUtils = require('../../utils/db/inactiveWorkplacesUtils');
const setParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/setParentWorkplaces');

const { generateInactiveWorkplacesTab } = require('./workplaces');
const { generateParentWorkplaceTab } = require('./parents');
const { generateSubsidaryWorkplaceTab } = require('./subsidiaries');
const { generateInactiveWorkplacesForDeletionTab } = require('./deleteInactiveWorkplace');
const { checkIfViewShouldRefresh } = require('../../utils/reportsUtils');

const generateInactiveWorkplacesReport = async (workbook, stopViewRefresh) => {
  await checkIfViewShouldRefresh(stopViewRefresh);

  const parentWorkplaces = await setParentWorkplaces.findParentWorkplaces();

  await generateInactiveWorkplacesTab(workbook);
  generateParentWorkplaceTab(workbook, parentWorkplaces);
  generateSubsidaryWorkplaceTab(workbook, parentWorkplaces);
  await generateInactiveWorkplacesForDeletionTab(workbook);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generateInactiveWorkplacesReport,
};

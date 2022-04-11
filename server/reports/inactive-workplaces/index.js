const excelUtils = require('../../utils/excelUtils');

const findInactiveWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const findParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

const workplaceWorksheetBuilder = require('./workplaces');
const parentWorksheetBuilder = require('./parents');
const { generateSubsidaryTab } = require('./subsidiaries');
const { generateInactiveWorkplacesForDeletionTab } = require('./deleteInactiveWorkplace');

const generateInactiveWorkplacesReport = async (workbook) => {
  // Build inactive worksheet
  const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();

  const inactiveWorksheet = workplaceWorksheetBuilder.addWorksheet(workbook);
  const inactiveWorkplaceRows = workplaceWorksheetBuilder.buildRows(inactiveWorkplaces);
  inactiveWorksheet.addRows(inactiveWorkplaceRows);

  // Build parent worksheet
  const parentWorkplaces = await findParentWorkplaces.findParentWorkplaces();

  const parentWorksheet = parentWorksheetBuilder.addWorksheet(workbook);
  const parentRows = parentWorksheetBuilder.buildRows(parentWorkplaces);
  parentWorksheet.addRows(parentRows);

  // Build subsidiary worksheet

  await generateSubsidaryTab(workbook);
  await generateInactiveWorkplacesForDeletionTab(workbook);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generateInactiveWorkplacesReport,
};

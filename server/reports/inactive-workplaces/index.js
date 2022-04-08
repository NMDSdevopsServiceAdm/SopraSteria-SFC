const excelUtils = require('../../utils/excelUtils');

const findInactiveWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const findParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');
const findInactiveWorkplacesForArchive = require('../../services/email-campaigns/inactive-workplaces/findInactiveWorkplacesForArchive');

const workplaceWorksheetBuilder = require('./workplaces');
const parentWorksheetBuilder = require('./parents');
const subsidiaryWorksheetBuilder = require('./subsidiaries');
const archivedInactiveWorkplacesBuilder = require('./archivedInactiveWorkplace');

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
  const subsidiaryWorksheet = subsidiaryWorksheetBuilder.addWorksheet(workbook);
  parentWorkplaces.map((workplace) => {
    const subsidiaryRows = subsidiaryWorksheetBuilder.buildRows(workplace, workplace.subsidiaries);
    subsidiaryWorksheet.addRows(subsidiaryRows);
  });

  // workplaces to be deleted
  const inactiveWorkplacesForArchive = await findInactiveWorkplacesForArchive.findInactiveWorkplacesForArchive();

  const archivedInactiveWorkplacesWorksheet = archivedInactiveWorkplacesBuilder.addWorksheet(workbook);
  const archivedInactiveWorkplacesWorksheetRows =
    archivedInactiveWorkplacesBuilder.buildRows(inactiveWorkplacesForArchive);
  archivedInactiveWorkplacesWorksheet.addRows(archivedInactiveWorkplacesWorksheetRows);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generateInactiveWorkplacesReport,
};

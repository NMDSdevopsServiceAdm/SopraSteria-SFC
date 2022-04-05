const excelJS = require('exceljs');
const excelUtils = require('../../utils/excelUtils');

const findInactiveWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const findParentWorkplaces = require('../../services/email-campaigns/inactive-workplaces/findParentWorkplaces');

const workplaceWorksheetBuilder = require('./workplaces');
const parentWorksheetBuilder = require('./parents');
const subsidiaryWorksheetBuilder = require('./subsidiaries');
const archivedInactiveWorkplaces = require('./archived-inactive-workplace');

const generate = async () => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

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

  // Inactive workplaces
  const archivedInactiveWorkplacesTab = archivedInactiveWorkplaces.addWorksheet(workbook);

  parentWorkplaces.map((workplace) => {
    const subsidiaryRows = subsidiaryWorksheetBuilder.buildRows(workplace, workplace.subsidiaries);
    subsidiaryWorksheet.addRows(subsidiaryRows);
  });

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generate,
};

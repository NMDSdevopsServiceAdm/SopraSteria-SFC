const excelJS = require('exceljs');
const express = require('express');
const moment = require('moment');
const findInactiveWorkplaces = require('../../../../services/email-campaigns/inactive-workplaces/findInactiveWorkplaces');
const excelUtils = require('../../../../utils/excelUtils');

const printRow = (worksheet, item) => {
  worksheet.addRow({
    workplace: item.name,
    workplaceId: item.nmdsId,
    lastUpdated: item.lastUpdated,
    emailTemplate: item.emailTemplate.name,
    dataOwner: item.dataOwner,
    nameOfUser: item.user.name,
    userEmail: item.user.email,
  });
};

const generateReport = async (_, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('Inactive workplaces');
  worksheet.columns = [
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Date last updated', key: 'lastUpdated' },
    { header: 'Email template', key: 'emailTemplate' },
    { header: 'Data owner', key: 'dataOwner' },
    { header: 'Name of user', key: 'nameOfUser' },
    { header: 'User email', key: 'userEmail' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  const inactiveWorkplaces = await findInactiveWorkplaces.findInactiveWorkplaces();
  inactiveWorkplaces.forEach((workplace) => {
    printRow(worksheet, workplace);
  });

  excelUtils.fitColumnsToSize(worksheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-inactiveWorkplaces.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

const router = express.Router();
router.route('/').get(generateReport);

module.exports = router;
module.exports.generateReport = generateReport;
module.exports.printRow = printRow;

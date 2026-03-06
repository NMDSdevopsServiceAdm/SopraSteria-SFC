const excelJS = require('exceljs');
const excelUtils = require('../../../utils/excelUtils');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const { UserResearchInviteResponsesDataService } = require('./data');

const printRow = (worksheet, result) => {
  worksheet.addRow({
    workplaceID: result?.establishment?.dataValues?.nmdsId ?? '',
    name: result?.FullNameValue ?? '',
    emailAddress: result?.EmailValue ?? '',
    jobRole: result?.JobTitleValue ?? '',
    mainService: result?.establishment?.dataValues?.mainService?.dataValues?.name ?? '',
    totalStaff: result?.establishment?.dataValues?.NumberOfStaffValue ?? '',
    userResearchInviteResponse: result?.UserResearchInviteResponseValue ?? '',
    createdDate: result?.created ?? '',
    updatedDate: ''
  });
};

const generateUserResearchInviteResponsesReport = async (_req, res) => {
  const reportData = await UserResearchInviteResponsesDataService.getReportData();
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('User Research Invite Responses');
  worksheet.columns = [
    { header: 'Workplace ID', key: 'workplaceID' },
    { header: 'Name', key: 'name' },
    { header: 'Email Address', key: 'emailAddress' },
    { header: 'Job Role', key: 'jobRole' },
    { header: 'Main Service', key: 'mainService' },
    { header: 'Total Staff', key: 'totalStaff' },
    { header: 'User Research Invite Response', key: 'userResearchInviteResponse' },
    { header: 'User Creation Date', key: 'createdDate' },
    { header: 'Updated Date', key: 'updatedDate' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  reportData.forEach((response) => {
    printRow(worksheet, response.dataValues);
  });

  excelUtils.fitColumnsToSize(worksheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-user-research-invite-responses-report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

module.exports = router;
module.exports.generateUserResearchInviteResponsesReport = generateUserResearchInviteResponsesReport;
module.exports.printRow = printRow;

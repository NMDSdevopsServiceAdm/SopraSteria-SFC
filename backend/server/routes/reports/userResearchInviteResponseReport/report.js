const models = require('../../../../server/models');

const excelJS = require('exceljs');
const excelUtils = require('../../../utils/excelUtils');
const moment = require('moment');
const express = require('express');
const router = express.Router();

const { UserResearchInviteResponseDataService } = require('./data');

const printRow = (worksheet, result) => {
  worksheet.addRow({
    workplaceID: result.user ? result.user.EstablishmentID : '',
    name: result.user ? result.user.FullNameValue : '',
    emailAddress: result.user ? result.user.EmailValue : '',
    jobRole: result.user ? result.user.JobTitleValue : '',
    mainService: '',
    totalStaff: '',
    userResearchInviteResponse: result.user ? result.UserResearchInviteResponseValue : '',
    createdDate: result.user ? result.user.created : '',
    updatedDate: ''
  });
};

const generateUserResearchInviteResponsesReport = async (_req, res) => {
  const reportData = await UserResearchInviteResponseDataService.getAllUsers();
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
    { header: 'Created Date', key: 'createdDate' },
    { header: 'Updated Date', key: 'updatedDate' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  reportData.forEach((response) => {
    printRow(worksheet, response);
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
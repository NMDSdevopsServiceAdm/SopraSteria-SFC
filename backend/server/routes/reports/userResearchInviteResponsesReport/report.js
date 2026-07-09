const excelJS = require('exceljs');
const excelUtils = require('../../../utils/excelUtils');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const { UserResearchInviteResponsesDataService } = require('./data');
const { UserResearchInviteResponseChangesDataService } = require('./userResearchResponseChangesData');

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
    updatedDate: result?.updated ?? '',
  });
};

const generateUserResearchInviteResponsesReport = async (_req, res) => {
  const reportData = await UserResearchInviteResponsesDataService.getReportData();
  const changesData = await UserResearchInviteResponseChangesDataService.getReportData();
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('User Research Invite Responses');

  const changesWorksheet = workbook.addWorksheet('Response Changes');

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

  changesWorksheet.columns = [
    { header: 'Workplace ID', key: 'workplaceID' },
    { header: 'Name', key: 'name' },
    { header: 'Email Address', key: 'emailAddress' },
    { header: 'Job Role', key: 'jobRole' },
    { header: 'Main Service', key: 'mainService' },
    { header: 'Total Staff', key: 'totalStaff' },
    { header: 'previous response', key: 'currentValue' },
    { header: 'latest response', key: 'newValue' },
    { header: 'change date (latest response)', key: 'changeDate' },
    { header: 'change date (user details)', key: 'updatedDate' },
  ];

  changesData.forEach((user) => {
    const result = user.dataValues;

    const latestChangedEvent = result.auditEvents?.sort((a, b) => new Date(b.when) - new Date(a.when))[0];

    changesWorksheet.addRow({
      workplaceID: result?.establishment?.dataValues?.nmdsId ?? '',
      name: result?.FullNameValue ?? '',
      emailAddress: result?.EmailValue ?? '',
      jobRole: result?.JobTitleValue ?? '',
      mainService: result?.establishment?.dataValues?.mainService?.dataValues?.name ?? '',
      totalStaff: result?.establishment?.dataValues?.NumberOfStaffValue ?? '',

      currentValue: latestChangedEvent?.event?.current ?? '',
      newValue: latestChangedEvent?.event?.new ?? '',
      changeDate: latestChangedEvent?.when ?? '',
      updatedDate: result?.updated ?? '',
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  reportData.forEach((response) => {
    printRow(worksheet, response.dataValues);
  });

  excelUtils.fitColumnsToSize(worksheet);
  excelUtils.fitColumnsToSize(changesWorksheet);

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

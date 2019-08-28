// Local Authority admin report
// Local Authority admin report
const express = require('express');
const UserAgentParser = require('ua-parser-js');
const router = express.Router();

// for database
const models = require('../../../models');

// local helper helper functions
const _csvQuote = (toCsv) => {
  if (toCsv === null) return '';

  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  } else {
    return toCsv;
  }
};
const _csvNoNull = (toCsv) => {
  if (toCsv) {
    return toCsv;
  } else {
    return '';
  }
};
const _fromDateToCsvDate = (convertThis) => {
  if (convertThis) {
    const datePart = convertThis.toISOString().substring(0,10);
    const dateParts = datePart.split('-');

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  } else {
    return '';
  }
};

// gets report
router.route('/').get(async (req, res) => {
  const userAgent = UserAgentParser(req.headers['user-agent']);
  const windowsTest = /windows/i;
  const NEWLINE = windowsTest.test(userAgent.os.name) ? "\r\n" : "\n";

  try {

    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-disposition', 'attachment; filename=' + `${date}-sfc-wdf-summary-report.csv`);
    res.setHeader('Content-Type', 'text/csv');

    // write dummy data
    res.write('COLUMNA,\
COLUMN2,\
COLUMNC3'+NEWLINE);

    res.write(`1,\
${_csvQuote('A "quoted" text value')},\
${date}`+NEWLINE);

    return res.status(200).end();

  } catch (err) {
    console.error('report/localAuthority/admin - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
});

module.exports = router;

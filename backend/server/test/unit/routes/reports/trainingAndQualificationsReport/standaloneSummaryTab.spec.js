const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { getTrainingTotals } = require('../../../../../utils/trainingAndQualificationsUtils');
const { mockWorkerTrainingBreakdowns } = require('../../../mockdata/trainingAndQualifications');
const { generateSummaryTab } = require('../../../../../routes/reports/trainingAndQualifications/standaloneSummaryTab');

describe('SummaryTab (Standalone)', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  const mockWorkplace = {};

  describe('generateSummaryTab', () => {
    it('should add a worksheet for summary', () => {
      generateSummaryTab(workbook);
    });
  });
});

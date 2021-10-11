const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const {
  addContentToCareCertificateTab,
} = require('../../../../../routes/reports/trainingAndQualifications/careCertificateTab');
const { mockWorkerCareCertificate } = require('../../../mockdata/trainingAndQualifications');

describe.only('generateTrainingAndQualificationsReport', () => {
  let mockCareCertificateTab;

  beforeEach(() => {
    mockCareCertificateTab = new excelJS.Workbook().addWorksheet('Care Certificate', {
      views: [{ showGridLines: false }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToCareCertificateTab(mockCareCertificateTab, mockWorkerCareCertificate);

    expect(mockCareCertificateTab.getCell('B2').value).to.equal('Care Certificate');
  });
});

const expect = require('chai').expect;
const excelJS = require('exceljs');

const { addContentToWorkplacesWithoutEmailTab } = require('../../../../reports/targeted-emails/WorkplacesWithoutEmail');

describe('addContentToWorkplacesWithoutEmailTab', () => {
  let mockWorkplacesWithoutEmailTab;
  const workplacesWithoutEmail = ['A123456', 'A123459'];

  beforeEach(() => {
    mockWorkplacesWithoutEmailTab = new excelJS.Workbook().addWorksheet('Found Workplaces');
  });

  it('should add NMDS ID header to top row', async () => {
    addContentToWorkplacesWithoutEmailTab(mockWorkplacesWithoutEmailTab, workplacesWithoutEmail);

    expect(mockWorkplacesWithoutEmailTab.getCell('A1').value).to.equal('NMDS ID');
  });

  it('should add the first NMDS ID in workplacesWithoutEmail to second row', async () => {
    addContentToWorkplacesWithoutEmailTab(mockWorkplacesWithoutEmailTab, workplacesWithoutEmail);

    expect(mockWorkplacesWithoutEmailTab.getCell('A2').value).to.equal('A123456');
  });

  it('should add the second NMDS ID in workplacesWithoutEmail to third row', async () => {
    addContentToWorkplacesWithoutEmailTab(mockWorkplacesWithoutEmailTab, workplacesWithoutEmail);

    expect(mockWorkplacesWithoutEmailTab.getCell('A3').value).to.equal('A123459');
  });
});

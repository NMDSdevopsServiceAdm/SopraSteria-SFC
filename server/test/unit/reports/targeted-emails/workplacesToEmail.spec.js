const expect = require('chai').expect;
const excelJS = require('exceljs');

const { addContentToWorkplacesToEmailTab } = require('../../../../reports/targeted-emails/workplacesToEmail');

describe('addContentToWorkplacesToEmailTab', () => {
  let mockWorkplacesToEmailTab;
  const mockUsers = [
    {
      get() {
        return 'mock@email.com';
      },
      establishment: {
        nmdsId: 'A123456',
      },
    },
    {
      get() {
        return 'mock2@email.com';
      },
      establishment: {
        nmdsId: 'A123459',
      },
    },
  ];

  beforeEach(() => {
    mockWorkplacesToEmailTab = new excelJS.Workbook().addWorksheet('Found Workplaces');
  });

  it('should add tab NMDS ID and Email Address headers to top row', async () => {
    addContentToWorkplacesToEmailTab(mockWorkplacesToEmailTab, mockUsers);

    expect(mockWorkplacesToEmailTab.getCell('A1').value).to.equal('NMDS ID');
    expect(mockWorkplacesToEmailTab.getCell('B1').value).to.equal('Email Address');
  });

  it('should add the NMDS ID and Email Address of first user to second row', async () => {
    addContentToWorkplacesToEmailTab(mockWorkplacesToEmailTab, mockUsers);

    expect(mockWorkplacesToEmailTab.getCell('A2').value).to.equal('A123456');
    expect(mockWorkplacesToEmailTab.getCell('B2').value).to.equal('mock@email.com');
  });

  it('should add the NMDS ID and Email Address of second user to third row', async () => {
    addContentToWorkplacesToEmailTab(mockWorkplacesToEmailTab, mockUsers);

    expect(mockWorkplacesToEmailTab.getCell('A3').value).to.equal('A123459');
    expect(mockWorkplacesToEmailTab.getCell('B3').value).to.equal('mock2@email.com');
  });
});

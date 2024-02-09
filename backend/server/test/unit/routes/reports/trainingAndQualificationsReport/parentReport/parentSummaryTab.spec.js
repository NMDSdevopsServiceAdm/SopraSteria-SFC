const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToSummaryTab } = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentSummaryTab');
const { getTrainingTotals } = require('../../../../../../utils/trainingAndQualificationsUtils');
const { mockWorkerTrainingBreakdowns, secondMockWorkerTrainingBreakdowns } = require('../../../../mockdata/trainingAndQualifications');

describe('addContentToSummaryTab', () => {
  let mockSummaryTab;

  const mockEstablishmentTrainingTotals = [
    {
      establishmentName: 'Test Name',
      totals: getTrainingTotals(mockWorkerTrainingBreakdowns),
    },
    {
      establishmentName: 'Care Home',
      totals: getTrainingTotals(secondMockWorkerTrainingBreakdowns),
    },
  ]

  beforeEach(() => {
    mockSummaryTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

    expect(mockSummaryTab.getCell('B2').value).to.equal('Training (summary)');
  });

  it('should add all training record status types to row 6', async () => {
    addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

    expect(mockSummaryTab.getCell('C6').value).to.equal('Up to date');
    expect(mockSummaryTab.getCell('F6').value).to.equal('Expiring soon');
    expect(mockSummaryTab.getCell('I6').value).to.equal('Expired');
    expect(mockSummaryTab.getCell('L6').value).to.equal('Missing');
  });

  it('should display the workplace name', () => {
    addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

    expect(mockSummaryTab.getCell('B9').value).to.equal('Test Name');
    expect(mockSummaryTab.getCell('B10').value).to.equal('Care Home');
  })

  describe('Up to date training', () => {
    it('should add up to date training totals for the first workplace to row 9', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('C9').value).to.equal(15);

      expect(mockSummaryTab.getCell('D7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('D9').value).to.equal(5);

      expect(mockSummaryTab.getCell('E7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('E9').value).to.equal(10);
    });

    it('should add up to date training totals for the second workplace to row 10', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('C10').value).to.equal(13);

      expect(mockSummaryTab.getCell('D7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('D10').value).to.equal(5);

      expect(mockSummaryTab.getCell('E7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('E10').value).to.equal(8);
    });
  });

  describe('Expiring soon training', () => {
    it('should add expiring soon training totals for the first workplace to row 9', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('F7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('F9').value).to.equal(8);

      expect(mockSummaryTab.getCell('G7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('G9').value).to.equal(2);

      expect(mockSummaryTab.getCell('H7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('H9').value).to.equal(6);
    });

    it('should add expiring soon training totals for the second workplace to row 10', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('F7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('F10').value).to.equal(6);

      expect(mockSummaryTab.getCell('G7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('G10').value).to.equal(2);

      expect(mockSummaryTab.getCell('H7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('H10').value).to.equal(4);
    });
  });

  describe('Expired training', () => {
    it('should add expired training totals for the first workplace to row 9', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('I7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('I9').value).to.equal(12);

      expect(mockSummaryTab.getCell('J7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('J9').value).to.equal(4);

      expect(mockSummaryTab.getCell('K7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('K9').value).to.equal(8);
    });

    it('should add expired training totals for the second workplace to row 10', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('I7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('I10').value).to.equal(4);

      expect(mockSummaryTab.getCell('J7').value).to.equal('Mandatory')
      expect(mockSummaryTab.getCell('J10').value).to.equal(0);

      expect(mockSummaryTab.getCell('K7').value).to.equal('Non-mandatory')
      expect(mockSummaryTab.getCell('K10').value).to.equal(4);
    });
  });

  describe('Missing training', () => {
    it('should add missing training totals for the first workplace to row 9', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('L7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('L9').value).to.equal(5);
    });

    it('should add missing training totals for the second workplace to row 10', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('L7').value).to.equal('Total')
      expect(mockSummaryTab.getCell('L10').value).to.equal(2);
    });
  });

  describe('addTotalsToSummaryTable()', () => {
    it('should calculate the totals for all workplaces for up to date training', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('C8').value).to.equal(28);
      expect(mockSummaryTab.getCell('D8').value).to.equal(10);
      expect(mockSummaryTab.getCell('E8').value).to.equal(18);
    });

    it('should calculate the totals for all workplaces for expiring soon training', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('F8').value).to.equal(14)
      expect(mockSummaryTab.getCell('G8').value).to.equal(4)
      expect(mockSummaryTab.getCell('H8').value).to.equal(10)
    });

    it('should calculate the totals for all workplaces for expired training', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('I8').value).to.equal(16)
      expect(mockSummaryTab.getCell('J8').value).to.equal(4)
      expect(mockSummaryTab.getCell('K8').value).to.equal(12)
    });

    it('should calculate the totals for all workplaces for missing training', async () => {
      addContentToSummaryTab(mockSummaryTab, mockEstablishmentTrainingTotals);

      expect(mockSummaryTab.getCell('L8').value).to.equal(7)
    });
  });
});

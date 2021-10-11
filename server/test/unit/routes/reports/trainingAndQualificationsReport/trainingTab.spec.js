const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToTrainingTab } = require('../../../../../routes/reports/trainingAndQualifications/trainingTab');

describe('addContentToTrainingTab', () => {
  const mockWorkerTrainingRecords = [
    {
      workerId: 'Bob Test',
      jobRole: 'Activities worker or co-ordinator',
      longTermAbsence: null,
      workerTraining: [
        {
          category: 'Activity provision/Well-being',
          categoryFK: 1,
          trainingName: 'Important Training',
          expiryDate: '2025-01-01',
          status: 'Up-to-date',
          dateCompleted: '2020-01-01',
          accredited: 'Yes',
        },
        {
          category: 'Dementia care',
          categoryFK: 10,
          trainingName: 'Mock Training Name',
          expiryDate: '2025-01-01',
          status: 'Expiring soon',
          dateCompleted: '2020-06-01',
          accredited: 'Yes',
        },
      ],
    },
    {
      workerId: '1234567',
      jobRole: 'Advice, Guidance and Advocacy',
      longTermAbsence: null,
      workerTraining: [
        {
          category: 'Emergency Aid awareness',
          categoryFK: 14,
          trainingName: 'Good',
          expiryDate: null,
          status: 'Up-to-date',
          dateCompleted: null,
          accredited: 'Yes',
        },
        {
          category: 'Diabetes',
          categoryFK: 11,
          trainingName: 'Good',
          expiryDate: null,
          status: 'Up-to-date',
          dateCompleted: '1980-03-31',
          accredited: 'Yes',
        },
      ],
    },
    {
      workerId: 'new staff record',
      jobRole: 'Activities worker or co-ordinator',
      longTermAbsence: null,
      workerTraining: [
        {
          category: 'First Aid',
          categoryFK: 18,
          trainingName: 'Great',
          expiryDate: null,
          status: 'Up-to-date',
          dateCompleted: null,
          accredited: 'Yes',
        },
        {
          category: 'Epilepsy',
          categoryFK: 15,
          trainingName: 'Training course',
          expiryDate: null,
          status: 'Up-to-date',
          dateCompleted: null,
          accredited: 'Yes',
        },
      ],
    },
  ];

  let mockTrainingTab;

  beforeEach(() => {
    mockTrainingTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add tab title to cell B2', async () => {
    addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, []);

    expect(mockTrainingTab.getCell('B2').value).to.equal('Training');
  });

  it('should add table headings to row 6', async () => {
    addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, []);

    expect(mockTrainingTab.getCell('B6').value).to.equal('Worker ID');
    expect(mockTrainingTab.getCell('C6').value).to.equal('Job role');
    expect(mockTrainingTab.getCell('D6').value).to.equal('Training category');
    expect(mockTrainingTab.getCell('E6').value).to.equal('Training name');
    expect(mockTrainingTab.getCell('F6').value).to.equal('Mandatory');
    expect(mockTrainingTab.getCell('G6').value).to.equal('Status');
    expect(mockTrainingTab.getCell('H6').value).to.equal('Expiry date');
    expect(mockTrainingTab.getCell('I6').value).to.equal('Date completed');
    expect(mockTrainingTab.getCell('J6').value).to.equal('Long-term absence');
    expect(mockTrainingTab.getCell('K6').value).to.equal('Accredited');
  });

  it('should add first training record to top row of table', async () => {
    addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, []);

    const expectedLine = 7;

    expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Bob Test');
    expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
    expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activity provision/Well-being');
    expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Important Training');
    expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Not mandatory');
    expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Up-to-date');
    expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('2025-01-01');
    expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('2020-01-01');
    expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal(null);
    expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Yes');
  });

  it("should add worker's next training record to next row of table", async () => {
    addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, []);

    const expectedLine = 8;

    expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Bob Test');
    expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
    expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Dementia care');
    expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Mock Training Name');
    expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Not mandatory');
    expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Expiring soon');
    expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('2025-01-01');
    expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('2020-06-01');
    expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal(null);
    expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Yes');
  });
});

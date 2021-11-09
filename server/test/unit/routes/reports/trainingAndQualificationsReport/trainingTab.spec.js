const expect = require('chai').expect;
const excelJS = require('exceljs');
const { mockWorkerTrainingRecords, mockParentWorkerTrainingRecords } = require('../../../mockdata/trainingAndQualifications');

const { addContentToTrainingTab } = require('../../../../../routes/reports/trainingAndQualifications/trainingTab');

describe('addContentToTrainingTab', () => {
  let mockTrainingTab;

  beforeEach(() => {
    mockTrainingTab = new excelJS.Workbook().addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  });

  describe('Single workplace Training tab', async () => {
    it('should add tab title to cell B2', async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      expect(mockTrainingTab.getCell('B2').value).to.equal('Training');
    });

    it('should add table headings to row 6', async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 6;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Worker ID');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Job role');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Training category');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Training name');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Status');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Expiry date');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('Date completed');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('Long-term absence');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Accredited');
    });

    it('should add first training record to top row of table', async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 7;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Bob Test');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Important Training');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Up-to-date');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('01/01/2025');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/01/2020');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Yes');
    });

    it("should add worker's next training record to next row of table", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 8;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Bob Test');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Dementia care');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Mock Training Name');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Not mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Expiring soon');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('01/01/2022');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/06/2020');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Yes');
    });

    it("should add next worker's first training record to next row of table when previous worker has no missing training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 9;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Emergency Aid awareness');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Practice of Emergency Aid');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Not mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Up-to-date');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('01/01/2025');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('31/03/2004');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Yes');
    });

    it("should add worker's next training record to next row", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 10;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Diabetes');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Training for diabetes');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Expired');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('01/01/2019');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('31/03/2012');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('No');
    });

    it("should add worker's missing training to next row if worker has missing mandatory training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 11;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
    });

    it("should add next worker's first missing training to next row if worker only has missing mandatory training and no records", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 12;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
    });

    it("should add worker's next missing training when worker has more than one missing mandatory training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

      const expectedLine = 13;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Diabetes');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
    });

    describe('Adding blank row to empty table', async () => {
      it('should not add empty row to end of table when there is data', async () => {
        addContentToTrainingTab(mockTrainingTab, mockWorkerTrainingRecords, false);

        const expectedLine = 14;

        expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal(null);
      });

      it('should add empty row to table when no data', async () => {
        addContentToTrainingTab(mockTrainingTab, [], false);

        const expectedLine = 7;

        expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      });
    });
  });

  describe('Parent Training tab', () => {
    it('should add tab title to cell B2', async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      expect(mockTrainingTab.getCell('B2').value).to.equal('Training');
    });

    it('should add table headings to row 6', async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 6;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Workplace');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Worker ID');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Job role');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Training category');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Training name');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Status');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('Expiry date');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('Date completed');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('Long-term absence');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('Accredited');
    });

    it('should add first training record to top row of table', async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 7;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('AAPNES East Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Bob Test');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Important Training');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Up-to-date');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/01/2025');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('01/01/2020');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('Yes');
    });

    it("should add worker's next training record to next row of table", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 8;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('AAPNES East Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Bob Test');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Dementia care');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Mock Training Name');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Not mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Expiring soon');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/01/2022');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('01/06/2020');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('Yes');
    });

    it("should add next workplace with worker's first training record to next row of table when previous worker has no missing training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 9;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Emergency Aid awareness');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Practice of Emergency Aid');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Not mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Up-to-date');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/01/2025');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('31/03/2004');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('Yes');
    });

    it("should add workplace with worker's next training record to next row", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 10;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Diabetes');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('Training for diabetes');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Expired');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('01/01/2019');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('31/03/2012');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('No');
    });

    it("should add workplace with worker's missing training to next row if worker has missing mandatory training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 11;
      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Eric Hatfield');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Advice, Guidance and Advocacy');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
    });

      it("should add workplace with next worker's first missing training to next row if worker only has missing mandatory training and no records", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 12;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('AAPNES East Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
    });

      it("should add workplace with worker's missing training when worker has missing mandatory training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 13;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('AAPNES East Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Diabetes');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
    });


    it("should add next workplace with next worker's first missing training to next row if worker only has missing mandatory training and no records", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 14;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Activity provision/Well-being');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
    });

      it("should add workplace with worker's missing training when worker has missing mandatory training", async () => {
      addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

      const expectedLine = 15;

      expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('Area Business Support');
      expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('Terrance Tate');
      expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('Activities worker or co-ordinator');
      expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('Diabetes');
      expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('Mandatory');
      expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('Missing');
      expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
      expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
    });

    describe('Adding blank row to empty table', async () => {
      it('should not add empty row to end of table when there is data', async () => {
        addContentToTrainingTab(mockTrainingTab, mockParentWorkerTrainingRecords, true);

        const expectedLine = 16;

        expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal(null);
        expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal(null);
      });

      it('should add empty row to table when no data', async () => {
        addContentToTrainingTab(mockTrainingTab, [], true);

        const expectedLine = 7;

        expect(mockTrainingTab.getCell(`B${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`C${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`D${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`E${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`F${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`G${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`H${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`I${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`J${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`K${expectedLine}`).value).to.equal('');
        expect(mockTrainingTab.getCell(`L${expectedLine}`).value).to.equal('');
      });
    });
  });
});

const expect = require('chai').expect;
const sinon = require('sinon');

const excelJS = require('exceljs');

const {
  parseRange,
  addText,
  newTextColours,
  addLink,
  setColourForRange,
  newBackgroundColours,
  forEachCellInRange,
  autoAdjustWrapTextAndRowHeight,
  countNumberOfLinesInCalibriFont,
} = require('../../../utils/excelUtils');

describe('excelUtils', () => {
  const setup = () => new excelJS.Workbook().addWorksheet('mock worksheet');

  describe('addText', () => {
    it('should add text to a cell', () => {
      const mockWorksheet = setup();
      addText(mockWorksheet, 'B3', 'some text');
      expect(mockWorksheet.getCell('B3').value).to.deep.equal('some text');
    });

    it('should merge the range if given a range', () => {
      const mockWorksheet = setup();
      addText(mockWorksheet, 'B3:D7', 'some text');

      const b3 = mockWorksheet.getCell('B3');
      expect(b3.value).to.deep.equal('some text');

      expect(b3.isMerged).to.be.true;
      expect(mockWorksheet.getCell('C5').isMergedTo(b3)).to.be.true;
      expect(mockWorksheet.getCell('D7').isMergedTo(b3)).to.be.true;
    });

    it('should not merge if given a single cell', () => {
      const mockWorksheet = setup();
      addText(mockWorksheet, 'B3', 'some text');
      expect(mockWorksheet.getCell('B3').isMerged).to.be.false;
    });

    it('should apply given font to the cell', () => {
      const mockWorksheet = setup();
      addText(mockWorksheet, 'B3', 'some text', { color: newTextColours.darkBlue, bold: true });
      expect(mockWorksheet.getCell('B3').font).to.deep.include({ color: newTextColours.darkBlue, bold: true });
    });
  });

  describe('addLink', () => {
    it('should add text and apply hyperlink style to a cell or a range', () => {
      const mockWorksheet = setup();

      addLink(mockWorksheet, 'B3', { text: 'link text', hyperlink: "#'worksheet2'!A1" });

      const cell = mockWorksheet.getCell('B3');

      expect(cell.value).to.deep.equal({ text: 'link text', hyperlink: "#'worksheet2'!A1" });
      expect(cell.font).to.deep.include({ color: newTextColours.linkBlue, underline: true });
    });
  });

  describe('setColourForRange', () => {
    it('should set the colours for all cells in the given range', () => {
      const mockWorksheet = setup();

      setColourForRange(mockWorksheet, 'B3:E7', {
        backgroundColour: newBackgroundColours.lightBlue,
        textColour: newTextColours.white,
      });

      ['B3', 'C5', 'E7'].forEach((coord) => {
        const cell = mockWorksheet.getCell(coord);
        expect(cell.fill).to.deep.include({
          type: 'pattern',
          pattern: 'solid',
          fgColor: newBackgroundColours.lightBlue,
        });
        expect(cell.font).to.deep.include({ color: newTextColours.white });
      });
    });
  });

  describe('forEachCellInRange', () => {
    it('should call a function with every cell in the given range', () => {
      const mockWorksheet = setup();

      const mockCallback = sinon.spy();
      forEachCellInRange(mockWorksheet, 'B3:D5', mockCallback);

      const expectedCells = ['B3', 'B4', 'B5', 'C3', 'C4', 'C5', 'D3', 'D4', 'D5'];

      expect(mockCallback.callCount).to.equal(expectedCells.length);
      expectedCells.forEach((coord) => {
        const cell = mockWorksheet.getCell(coord);
        expect(mockCallback).to.have.been.calledWith(cell);
      });
    });
  });

  describe('parseRange', () => {
    it('should take an excel range notation and list all the columns and rows in the range', () => {
      const input = 'A1:D3';
      const expected = { columns: ['A', 'B', 'C', 'D'], rows: [1, 2, 3] };
      const actual = parseRange(input);

      expect(actual).to.deep.equal(expected);
    });

    it('should handle column labels with more than one character correctly', () => {
      const input = 'X8:AC12';
      const expected = { columns: ['X', 'Y', 'Z', 'AA', 'AB', 'AC'], rows: [8, 9, 10, 11, 12] };
      const actual = parseRange(input);

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('autoAdjustWrapTextAndRowHeight', () => {
    const setup = () => {
      const mockWorksheet = new excelJS.Workbook().addWorksheet('mock worksheet');
      const cell = mockWorksheet.getCell('B2');
      cell.value = 'some text';
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      mockWorksheet.getRow(2).height = 22;

      return mockWorksheet;
    };

    it('should set the cell alignment to { wrapText: true } and row height to undefined', () => {
      const mockWorksheet = setup();

      const cell = mockWorksheet.getCell('B2');

      autoAdjustWrapTextAndRowHeight(mockWorksheet, cell);

      expect(cell.alignment).to.deep.equal({ vertical: 'middle', horizontal: 'center', wrapText: true });
      expect(mockWorksheet.getRow('2').height).to.equal(undefined);
    });
  });
});

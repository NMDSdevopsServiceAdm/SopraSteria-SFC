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
      expect(mockWorksheet.getCell('B3').font).to.include({ color: newTextColours.darkBlue, bold: true });
    });
  });

  describe('addLink', () => {
    it('should add text and apply hyperlink style to a cell or a range', () => {
      const mockWorksheet = setup();

      addLink(mockWorksheet, 'B3', { text: 'link text', hyperlink: "#'worksheet2'!A1" });

      const cell = mockWorksheet.getCell('B3');

      expect(cell.value).to.deep.equal({ text: 'link text', hyperlink: "#'worksheet2'!A1" });
      expect(cell.font).to.include({ color: newTextColours.linkBlue, underline: true });
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
    it('should set a cell to { wrapText: true } and increase the height if text is longer than the given length', () => {
      const mockWorksheet = setup();

      const cell = mockWorksheet.getCell('B2');
      cell.value = 'some very very very very very very very very very very long text';

      autoAdjustWrapTextAndRowHeight(mockWorksheet, cell);

      expect(mockWorksheet.getCell('B2').alignment).to.deep.equal({ wrapText: true });
      expect(mockWorksheet.getRow('2').height).to.equal(34);
    });

    it('should not change the cell properties if the text is not long enough', () => {
      const mockWorksheet = setup();

      const cell = mockWorksheet.getCell('B2');
      cell.value = 'some value';
      cell.alignment = {};

      autoAdjustWrapTextAndRowHeight(mockWorksheet, cell);

      expect(mockWorksheet.getCell('B2').alignment).to.deep.equal({});
      expect(mockWorksheet.getRow('2').height).to.equal(undefined);
    });

    it('should accept an optional length and default row height as argument', () => {
      const mockWorksheet = setup();

      const cell = mockWorksheet.getCell('B2');
      cell.value = 'a text of length 20 ';

      autoAdjustWrapTextAndRowHeight(mockWorksheet, cell, 5, 15);
      const expectedRowHeight = 15 * (20 / 5) - 10;

      expect(mockWorksheet.getCell('B2').alignment).to.deep.equal({ wrapText: true });
      expect(mockWorksheet.getRow('2').height).to.equal(expectedRowHeight);
    });
  });
});

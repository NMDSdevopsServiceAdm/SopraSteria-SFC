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

  describe('countNumberOfLinesInCalibriFont', () => {
    it('should return 1 if given an empty input', () => {
      const testCases = ['', ' ', '    ', undefined, null];
      testCases.forEach((input) => {
        expect(countNumberOfLinesInCalibriFont(input)).to.equal(1);
      });
    });

    describe('should estimated the number of lines needed to show the given text within the given column width', () => {
      const testCases = [
        {
          text: 'Awareness of end of life care (level 2)',
          expected: 1,
        },
        {
          text: 'Delivering chair-based exercise with',
          expected: 1,
        },
        {
          text: 'Delivering chair-based exercise with frailer',
          expected: 2,
        },
        {
          text: 'Advanced Award in Social Work (AASW, level 7)',
          expected: 2,
        },
        {
          text: 'Supporting individuals with autism (level 3)',
          expected: 2,
        },
        {
          text: 'V1 or other internal verifier NVQ (level 3)',
          expected: 1,
        },
        {
          text: 'Food safety in health and social care, and early years and childcare settings (level 2)',
          expected: 3,
        },
        {
          text: 'Delivering chair-based exercise with frailer older adults and adults with disabilities in care and community settings (level 2)',
          expected: 4,
        },
        {
          text: 'Understanding the safe handling of medication in health and social care (level 2)',
          expected: 3,
        },
        {
          text: 'Any Learning Disabled Awards Framework ',
          expected: 2,
        },
      ];

      testCases.forEach(({ text, expected }) => {
        it(`text input: ${text}, expected number of lines: ${expected}`, () => {
          const actual = countNumberOfLinesInCalibriFont(text);
          expect(actual).to.equal(expected);
        });
      });
    });

    it('should handle word break with hyphen', () => {
      const text = 'Any qualification in assessment of work-based learning, other than social work';
      const expected = 2;

      const actual = countNumberOfLinesInCalibriFont(text);
      expect(actual).to.equal(expected);
    });

    it('should give different results according to column width', () => {
      const textInput = 'Activity provision and wellbeing course A';

      const testCases = [
        { columnWidth: 30, expectedNumberOfLines: 2 },
        { columnWidth: 35, expectedNumberOfLines: 1 },
      ];

      testCases.forEach(({ columnWidth, expectedNumberOfLines }) => {
        const actual = countNumberOfLinesInCalibriFont(textInput, columnWidth);
        expect(actual).to.equal(expectedNumberOfLines);
      });
    });
  });
});

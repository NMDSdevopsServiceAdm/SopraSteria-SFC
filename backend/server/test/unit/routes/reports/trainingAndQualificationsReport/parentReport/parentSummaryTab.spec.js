const expect = require('chai').expect;
const lodash = require('lodash');
const excelJS = require('exceljs');
const {
  mockSummaryTabDataForParent,
  mockSummaryTabDataForWorkplaceB,
  mockSummaryTabDataForWorkplaceA,
} = require('../../../../mockdata/trainingAndQualifications');
const {
  generateParentSummaryTab,
} = require('../../../../../../routes/reports/trainingAndQualifications/parentReport/parentSummaryTab');

describe('SummaryTab (Parent)', () => {
  let workbook;

  beforeEach(() => {
    workbook = new excelJS.Workbook();
  });

  describe('generateParentSummaryTab', () => {
    const mockParentWorkplace = {
      NameValue: 'mock parent workplace',
    };

    it('should add a worksheet for summary', () => {
      generateParentSummaryTab(workbook, mockParentWorkplace, mockSummaryTabDataForParent);

      const tab = workbook.getWorksheet('Summary');

      expect(tab.getCell('B2').value).to.deep.equal('mock parent workplace');
      expect(tab.getCell('B3').value).to.deep.equal('Summary');
    });

    it('should add a table for summary data of each sub workplace', () => {
      generateParentSummaryTab(workbook, mockParentWorkplace, mockSummaryTabDataForParent);

      const tab = workbook.getWorksheet('Summary');

      mockSummaryTabDataForParent.workplacesData.forEach((workplace, index) => {
        const expectedRowNumber = 8 + index;
        const row = tab.getRow(expectedRowNumber);

        const actualValues = row.values.slice(2);
        const expectedValues = [
          workplace.workplaceName,

          workplace.trainingBreakdownTotals.expiredTrainingCount,
          workplace.trainingBreakdownTotals.expiringTrainingCount,
          workplace.trainingBreakdownTotals.upToDateTrainingCount,
          workplace.trainingBreakdownTotals.trainingCount,

          workplace.trainingBreakdownTotals.expiredMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.expiringMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.upToDateMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.mandatoryTrainingCount,
          workplace.trainingBreakdownTotals.missingMandatoryTrainingCount,

          workplace.trainingBreakdownTotals.expiredNonMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.expiringNonMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.upToDateNonMandatoryTrainingCount,
          workplace.trainingBreakdownTotals.nonMandatoryTrainingCount,

          workplace.careCertAndQualificationLevels.careCertificate['Yes, completed'],
          workplace.careCertAndQualificationLevels.careCertificate['Yes, in progress or partially completed'],
          workplace.careCertAndQualificationLevels.careCertificate['No'],

          workplace.careCertAndQualificationLevels.level2CareCertificate['Yes, completed'],
          workplace.careCertAndQualificationLevels.level2CareCertificate['Yes, started'],
          workplace.careCertAndQualificationLevels.level2CareCertificate['No'],

          workplace.careCertAndQualificationLevels.socialCareQualificationLevel['Level 2 or above'],
          workplace.careCertAndQualificationLevels.socialCareQualificationLevel['Level 2'],
          workplace.careCertAndQualificationLevels.socialCareQualificationLevel['Level 3'],
          workplace.careCertAndQualificationLevels.socialCareQualificationLevel['Level 4'],
          workplace.careCertAndQualificationLevels.socialCareQualificationLevel['Level 5 or above'],
        ].map((value) => value ?? 0);

        expect(actualValues).to.deep.equal(expectedValues);
      });

      expect(tab.getCell('B9').value).to.equal(mockSummaryTabDataForWorkplaceB.workplaceName);
    });

    it('should show an empty table if there are no worker and no trainings in every workplace', () => {
      generateParentSummaryTab(workbook, mockParentWorkplace, []);

      const tab = workbook.getWorksheet('Summary');
      expect(tab.getRow(7).values.slice(1)).to.deep.equal(Array(26).fill(''));
    });

    it('should show the training counts as "-" if a child workplace has no workers', () => {
      const mockData = lodash.cloneDeep(mockSummaryTabDataForParent);
      mockData.workplacesData[0].trainingBreakdownTotals = new Proxy(
        {},
        {
          get: () => null,
        },
      );

      generateParentSummaryTab(workbook, mockParentWorkplace, mockData);

      const tab = workbook.getWorksheet('Summary');
      expect(tab.getRow(8).values.slice(2, 16)).to.deep.equal([
        mockSummaryTabDataForWorkplaceA.workplaceName,
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    });
  });
});

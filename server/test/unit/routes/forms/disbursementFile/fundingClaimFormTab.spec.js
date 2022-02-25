const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToFundingClaimFormTab } = require('../../../../../routes/forms/disbursementFile/fundingClaimFormTab');

describe('generateFundingClaimFormTab', () => {
  let mockWorkbook;
  let mockFundingClaimFormTab;

  beforeEach(() => {
    (mockWorkbook = new excelJS.Workbook()),
      (mockFundingClaimFormTab = new excelJS.Workbook().addWorksheet('fundingClaimFormTable', {
        views: [{ showGridLines: false }],
      }));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Funding Claim Form', () => {
    it('should add tab title to cell A1', async () => {
      addContentToFundingClaimFormTab(mockWorkbook, mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A1').value).to.equal('FUNDING CLAIM FORM');
    });

    it('should add Grant Holder Name to cell A3', async () => {
      addContentToFundingClaimFormTab(mockWorkbook, mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A3').value).to.equal('Grant Holder Name:');
    });

    it('should add Grant Number to cell A6', async () => {
      addContentToFundingClaimFormTab(mockWorkbook, mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A6').value).to.equal('Grant Number:');
    });
  });
});

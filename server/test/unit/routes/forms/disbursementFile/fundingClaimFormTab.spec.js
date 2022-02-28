const expect = require('chai').expect;
const sinon = require('sinon');
const excelJS = require('exceljs');

const { addContentToFundingClaimFormTab } = require('../../../../../routes/wdf/disbursementFile/fundingClaimFormTab');

describe('generateFundingClaimFormTab', () => {
  let mockFundingClaimFormTab;

  beforeEach(() => {
    mockFundingClaimFormTab = new excelJS.Workbook().addWorksheet('fundingClaimFormTable', {
      views: [{ showGridLines: false }],
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Funding Claim Form', () => {
    it('should add tab title to cell A1', async () => {
      addContentToFundingClaimFormTab(mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A1').value).to.equal('FUNDING CLAIM FORM');
    });

    it('should add Grant Holder Name to cell A3', async () => {
      addContentToFundingClaimFormTab(mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A3').value).to.equal('Grant Holder Name:');
    });

    it('should add Grant Number to cell A6', async () => {
      addContentToFundingClaimFormTab(mockFundingClaimFormTab);

      expect(mockFundingClaimFormTab.getCell('A6').value).to.equal('Grant Number:');
    });

    describe('Funding Claim Form table', () => {
      it('should add Funding Claim Form records table headings to row 9', async () => {
        addContentToFundingClaimFormTab(mockFundingClaimFormTab);

        expect(mockFundingClaimFormTab.getCell('A9').value).to.equal('Organisation');
        expect(mockFundingClaimFormTab.getCell('B9').value).to.equal('ASC-WDS');
        expect(mockFundingClaimFormTab.getCell('C9').value).to.equal('Given Name');
        expect(mockFundingClaimFormTab.getCell('D9').value).to.equal('Family Name');
        expect(mockFundingClaimFormTab.getCell('E9').value).to.equal('Unique Learner Number (ULN)');
        expect(mockFundingClaimFormTab.getCell('F9').value).to.equal('Awarding Body');
        expect(mockFundingClaimFormTab.getCell('G9').value).to.equal('Candidate Registration Number');
        expect(mockFundingClaimFormTab.getCell('H9').value).to.equal('Qualification code');
        expect(mockFundingClaimFormTab.getCell('I9').value).to.equal(
          'FOR DIPLOMAS ONLY Is this being claimed as part of an apprenticeship?',
        );
        expect(mockFundingClaimFormTab.getCell('J9').value).to.equal(
          'Was qualification previously funded through up-front LM incentive?',
        );
        expect(mockFundingClaimFormTab.getCell('K9').value).to.equal('Value Claimed');
      });
    });
  });
});

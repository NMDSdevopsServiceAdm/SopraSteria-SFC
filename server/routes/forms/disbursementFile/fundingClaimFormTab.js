const {
  addHeading,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  fitColumnsToSize,
  addBlankRowIfTableEmpty,
  addBordersToAllFilledCells,
  setColumnWidths,
} = require('../../../utils/excelUtils');
const path = require('path');

const generateFundingClaimFormTab = (workbook) => {
  const fundingClaimFormTab = workbook.addWorksheet('Funding Claim Form', { views: [{ showGridLines: false }] });
  addContentToFundingClaimFormTab(fundingClaimFormTab);
};

const addContentToFundingClaimFormTab = (fundingClaimFormTab) => {
  addHeading(fundingClaimFormTab, 'A1', 'C1', 'FUNDING CLAIM FORM', textColours.black, 16);
  addHeading(fundingClaimFormTab, 'A3', 'C3', 'Grant Holder Name:', textColours.black, 12);
  addLine(fundingClaimFormTab, 'A5', 'E5');
  addHeading(fundingClaimFormTab, 'A6', 'C6', 'Grant Number:', textColours.black, 12);
  addLine(fundingClaimFormTab, 'A8', 'E8');
  const fundingClaimFormTable = createFundingClaimFormTable(fundingClaimFormTab);
  addRows(fundingClaimFormTable);
  fitColumnsToSize(fundingClaimFormTab, 1, 1.5);
  setColumnWidths(fundingClaimFormTab);
  addBordersToAllFilledCells(fundingClaimFormTab, 8);
};

const createFundingClaimFormTable = (fundingClaimFormTab) => {
  setTableHeadingsStyle(fundingClaimFormTab, 9, backgroundColours.lightBlue, textColours.black, tableHeaderRow);

  const columns = [
    { name: 'Organisation', filterButton: false },
    { name: 'ASC-WDS', filterButton: false },
    { name: 'Given Name', filterButton: false },
    { name: 'Family Name', filterButton: false },
    { name: 'Unique Learner Number (ULN)', filterButton: false },
    { name: 'Awarding Body', filterButton: false },
    { name: 'Candidate Registration Number', filterButton: false },
    { name: 'Qualification code', filterButton: false },
    { name: 'FOR DIPLOMAS ONLY Is this being claimed as part of an apprenticeship?', filterButton: false },
    { name: 'Was qualification previously funded through up-front LM incentive?', filterButton: false },
    { name: 'Value Claimed', filterButton: false },
  ];
  return fundingClaimFormTab.addTable({
    name: 'fundingClaimFormTable',
    ref: 'A9',
    columns,
    rows: [],
  });
};

const addRows = (fundingClaimFormTable) => {
  addBlankRowIfTableEmpty(fundingClaimFormTable, 10);
  fundingClaimFormTable.commit();
};

const tableHeaderRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

module.exports.generateFundingClaimFormTab = generateFundingClaimFormTab;
module.exports.addContentToFundingClaimFormTab = addContentToFundingClaimFormTab;

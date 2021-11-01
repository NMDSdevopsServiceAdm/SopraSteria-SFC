const { convertWorkerTrainingBreakdowns, getTrainingTotals } = require('../../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  // backgroundColours,
  // textColours,
  // setCellTextAndBackgroundColour,
  // setTableHeadingsStyle,
  alignColumnToLeft,
  addBordersToAllFilledCells,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(
    [establishmentId],
    true,
  );
  const workerTrainingBreakdowns = convertWorkerTrainingBreakdowns(rawEstablishmentTrainingBreakdowns[0].workers);
  const trainingRecordTotals = getTrainingTotals(workerTrainingBreakdowns);

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addContentToSummaryTab(summaryTab, workerTrainingBreakdowns, trainingRecordTotals);
};

const addContentToSummaryTab = (summaryTab, workerTrainingBreakdowns, trainingRecordTotals) => {
  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');
  alignColumnToLeft(summaryTab, 2);



  addBordersToAllFilledCells(summaryTab, 5);
};


module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;

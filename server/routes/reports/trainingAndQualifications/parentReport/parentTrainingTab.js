const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  fitColumnsToSize,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');
const generateTrainingTab = async( workbook, establishmentId) =>{

    const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });
    const rawWorkersWithTraining = await models.establishment.getEstablishmentTrainingRecords( [establishmentId],
      true,);


  addContentToTrainingTab(trainingTab);
};

const addContentToTrainingTab = (trainingTab) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4', 'L4');


    const trainingTable = createTrainingTable(trainingTab);

    fitColumnsToSize(trainingTab, 2, 5.5);
  };


const createTrainingTable = (trainingTab) => {
    const tableColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K','L'];
    setTableHeadingsStyle(trainingTab, 6, backgroundColours.blue, textColours.white, tableColumns);

    return trainingTab.addTable({
      name: 'trainingTable',
      ref: 'B6',
      columns: [
        { name: 'Workplace', filterButton: true },
        { name: 'Worker ID', filterButton: true },
        { name: 'Job role', filterButton: true },
        { name: 'Training category', filterButton: true },
        { name: 'Training name', filterButton: true },
        { name: 'Mandatory', filterButton: true },
        { name: 'Status', filterButton: true },
        { name: 'Expiry date', filterButton: true },
        { name: 'Date completed', filterButton: true },
        { name: 'Long-term absence', filterButton: true },
        { name: 'Accredited', filterButton: true },
      ],
      rows: [],
    });
  };

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
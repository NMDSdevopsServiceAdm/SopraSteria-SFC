
const generateTrainingTab = async( workbook, establishmentId) =>{

    const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });
};


module.exports.generateTrainingTab = generateTrainingTab;
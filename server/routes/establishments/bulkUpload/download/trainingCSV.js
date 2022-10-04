const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const { csvQuote } = require('../../../../utils/bulkUploadUtils');

const toCSV = (establishmentId, workerId, entity) => {
  // ["LOCALESTID","UNIQUEWORKERID","CATEGORY","DESCRIPTION","DATECOMPLETED","EXPIRYDATE","ACCREDITED","NOTES"]
  console.log('******* toCSC *******');
  console.log('entity.notes:', entity.notes);
  console.log(decodeURI(entity.notes));
  const columns = [
    csvQuote(establishmentId),
    csvQuote(workerId),
    BUDI.trainingCategory(BUDI.FROM_ASC, entity.category.id),
    entity.title ? csvQuote(entity.title) : '',
    convertDateFormatToDayMonthYearWithSlashes(entity.completed),
    convertDateFormatToDayMonthYearWithSlashes(entity.expires),
    convertAccredited(entity.accredited),
    entity.notes ? csvQuote(decodeURI(entity.notes)) : '',
  ];

  return columns.join(',');
};

const convertDateFormatToDayMonthYearWithSlashes = (dateText) => {
  if (dateText) {
    const dateParts = String(dateText).split('-');

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }

  return '';
};

const convertAccredited = (accredited) => {
  if (accredited === 'Yes') return 1;
  if (accredited === 'No') return 0;
  if (accredited === "Don't know") return 999;

  return '';
};

module.exports = {
  toCSV,
  convertDateFormatToDayMonthYearWithSlashes,
  convertAccredited,
};

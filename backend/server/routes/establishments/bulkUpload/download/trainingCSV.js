const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const { csvQuote } = require('../../../../utils/bulkUploadUtils');

const toCSV = (establishmentId, workerId, entity) => {
  // old columns : ["LOCALESTID","UNIQUEWORKERID","CATEGORY","DESCRIPTION","DATECOMPLETED","EXPIRYDATE","ACCREDITED","NOTES"]
  // new columns : LOCALESTID UNIQUEWORKERID CATEGORY TRAININGNAME ACCREDITED WHODELIVERED HOWDELIVERED VALIDITY DATECOMPLETED EXPIRYDATE NOTES

  const localEstId = csvQuote(establishmentId);
  const uniqueWorkerId = csvQuote(workerId);
  const category = BUDI.trainingCategory(BUDI.FROM_ASC, entity.category.id);
  const trainingName = entity.title ? csvQuote(entity.title) : '';
  const dateCompleted = convertDateFormatToDayMonthYearWithSlashes(entity.completed);
  const expiryDate = convertDateFormatToDayMonthYearWithSlashes(entity.expires);
  const accredited = convertAccredited(entity.accredited);
  const notes = entity.notes ? csvQuote(unescape(entity.notes)) : '';

  const columns = [localEstId, uniqueWorkerId, category, trainingName, dateCompleted, expiryDate, accredited, notes];

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

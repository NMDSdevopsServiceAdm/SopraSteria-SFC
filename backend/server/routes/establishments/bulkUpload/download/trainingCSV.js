const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const { TrainingCourseDeliveredBy, TrainingCourseDeliveryMode } = require('../../../../../reference/databaseEnumTypes');
const { csvQuote } = require('../../../../utils/bulkUploadUtils');

const toCSV = (establishmentId, workerId, entity) => {
  // columns : LOCALESTID UNIQUEWORKERID CATEGORY TRAININGNAME ACCREDITED WHODELIVERED PROVIDERNAME HOWDELIVERED VALIDITY DATECOMPLETED EXPIRYDATE NOTES

  const localEstId = csvQuote(establishmentId);
  const uniqueWorkerId = csvQuote(workerId);
  const category = BUDI.trainingCategory(BUDI.FROM_ASC, entity.category.id);
  const trainingName = entity.title ? csvQuote(entity.title) : '';
  const accredited = convertAccredited(entity.accredited);
  const whoDelivered = convertWhoDelivered(entity.deliveredBy);
  const providerName = convertProviderName(entity.deliveredBy, entity.externalProviderName);
  const howDelivered = convertHowDelivered(entity.howWasItDelivered);
  const validity = convertValidity(entity.doesNotExpire, entity.validityPeriodInMonth);
  const dateCompleted = convertDateFormatToDayMonthYearWithSlashes(entity.completed);
  const expiryDate = convertDateFormatToDayMonthYearWithSlashes(entity.expires);
  const notes = entity.notes ? csvQuote(unescape(entity.notes)) : '';

  const columns = [
    localEstId,
    uniqueWorkerId,
    category,
    trainingName,
    accredited,
    whoDelivered,
    providerName,
    howDelivered,
    validity,
    dateCompleted,
    expiryDate,
    notes,
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

const convertValidity = (doesNotExpire, validityPeriodInMonth) => {
  if (doesNotExpire) {
    return 'none';
  }

  if (validityPeriodInMonth && validityPeriodInMonth > 0) {
    return validityPeriodInMonth.toString();
  }
  return '';
};

const convertWhoDelivered = (deliveredBy) => {
  switch (deliveredBy) {
    case TrainingCourseDeliveredBy.InHouseStaff:
      return '1';

    case TrainingCourseDeliveredBy.ExternalProvider:
      return '2';

    default:
      return '';
  }
};

const convertProviderName = (deliveredBy, externalProviderName) => {
  if (deliveredBy !== TrainingCourseDeliveredBy.ExternalProvider) {
    return '';
  }

  return csvQuote(externalProviderName);
};

const convertHowDelivered = (howWasItDelivered) => {
  switch (howWasItDelivered) {
    case TrainingCourseDeliveryMode.FaceToFace: {
      return '1';
    }
    case TrainingCourseDeliveryMode.ELearning: {
      return '2';
    }
    default: {
      return '';
    }
  }
};

module.exports = {
  toCSV,
  convertDateFormatToDayMonthYearWithSlashes,
  convertAccredited,
  convertValidity,
  convertWhoDelivered,
  convertProviderName,
  convertHowDelivered,
};

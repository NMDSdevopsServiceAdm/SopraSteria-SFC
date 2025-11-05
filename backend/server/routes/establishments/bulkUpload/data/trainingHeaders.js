const trainingHeadersAsArray = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CATEGORY',
  'DESCRIPTION',
  'DATECOMPLETED',
  'EXPIRYDATE',
  'ACCREDITED',
  'NOTES',
];
const newTrainingHeadersAsArray = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CATEGORY',
  'TRAININGNAME',
  'ACCREDITED',
  'WHODELIVERED',
  'HOWDELIVERED',
  'VALIDITY',
  'DATECOMPLETED',
  'EXPIRYDATE',
  'NOTES',
];

exports.trainingHeaders = trainingHeadersAsArray.join(',');

const workerHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CHGUNIQUEWRKID',
  'STATUS',
  'DISPLAYID',
  'NINUMBER',
  'POSTCODE',
  'DOB',
  'GENDER',
  'ETHNICITY',
  'NATIONALITY',
  'BRITISHCITIZENSHIP',
  'COUNTRYOFBIRTH',
  'YEAROFENTRY',
  'DISABLED',
  'CARECERT',
  'L2CARECERT',
  'RECSOURCE',
  'HANDCVISA',
  'INOUTUK',
  'STARTDATE',
  'STARTINSECT',
  'APPRENTICE',
  'EMPLSTATUS',
  'ZEROHRCONT',
  'DAYSSICK',
  'SALARYINT',
  'SALARY',
  'HOURLYRATE',
  'MAINJOBROLE',
  'MAINJRDESC',
  'CONTHOURS',
  'AVGHOURS',
  'NMCREG',
  'NURSESPEC',
  'AMHP',
  'SCQUAL',
  'NONSCQUAL',
  'QUALACH01',
  'QUALACH01NOTES',
  'QUALACH02',
  'QUALACH02NOTES',
  'QUALACH03',
  'QUALACH03NOTES',
];

const workerHeadersWithoutCHGUNIQUEWRKIDasArray = workerHeaders.filter((header) => header !== 'CHGUNIQUEWRKID');

exports.workerHeadersWithCHGUNIQUEWRKID = workerHeaders.join(',');
exports.workerHeadersWithoutCHGUNIQUEWRKID = workerHeaders.filter((header) => header !== 'CHGUNIQUEWRKID').join(',');
exports.getWorkerColumnIndex = (columnName) =>
  workerHeadersWithoutCHGUNIQUEWRKIDasArray.findIndex((header) => header === columnName);

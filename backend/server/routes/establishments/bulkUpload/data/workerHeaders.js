const workerHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
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

const workerHeadersWithChangeUniqueWorkerIdAsArray = [
  ...workerHeaders.slice(0, 2),
  'CHGUNIQUEWRKID',
  workerHeaders.slice(2),
];

const workerHeadersWithTransferStaffRecordAsArray = [
  ...workerHeaders.slice(0, 2),
  'TRANSFERSTAFFRECORD',
  workerHeaders.slice(2),
];

exports.workerHeadersWithCHGUNIQUEWRKID = workerHeadersWithChangeUniqueWorkerIdAsArray.join(',');
exports.workerHeadersWithTransferStaff = workerHeadersWithTransferStaffRecordAsArray.join('');
exports.workerHeadersWithoutCHGUNIQUEWRKID = workerHeaders.join(',');
exports.getWorkerColumnIndex = (columnName) => workerHeaders.findIndex((header) => header === columnName);

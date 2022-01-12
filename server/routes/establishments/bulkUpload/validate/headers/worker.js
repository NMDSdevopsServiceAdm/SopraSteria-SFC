const workerHeaders = [
  'LOCALESTID',
  'UNIQUEWORKERID',
  'CHGUNIQUEWRKID',
  'STATUS',
  'DISPLAYID',
  'FLUVAC',
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
  'RECSOURCE',
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
  'OTHERJOBROLE',
  'OTHERJRDESC',
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

const workerHeadersWithCHGUNIQUEWRKID = workerHeaders.join(',');
const workerHeadersWithoutCHGUNIQUEWRKID = workerHeaders.filter((header) => header !== 'CHGUNIQUEWRKID').join(',');

const validateWorkerHeaders = (headers) => {
  const matchesWithChgUnique = headers.startsWith(workerHeadersWithCHGUNIQUEWRKID);
  const matchesWithoutChgUnique = headers.startsWith(workerHeadersWithoutCHGUNIQUEWRKID);

  if (!matchesWithChgUnique && !matchesWithoutChgUnique) {
    return false;
  }

  const additionalQualsHeaders = matchesWithChgUnique
    ? headers.slice(workerHeadersWithCHGUNIQUEWRKID.length)
    : headers.slice(workerHeadersWithoutCHGUNIQUEWRKID.length);

  return validateAdditionalQualificationsHeaders(additionalQualsHeaders);
};

const validateAdditionalQualificationsHeaders = (additionalQualsHeaders) => {
  if (additionalQualsHeaders.length) {
    // there are more than the default three qualifications, so validate the remaining headers (noting that the first character will be a comma)
    const remainingHeaders = additionalQualsHeaders.slice(1).split(',');

    // index goes up in twos as each qualification has 2 columns
    for (let i = 0, currentQualNumber = 4; i < remainingHeaders.length; i += 2, currentQualNumber++) {
      const currentQualNumberWithPrefix = `${currentQualNumber}`.padStart(2, '0');

      if (qualificationHeadersIncorrect(remainingHeaders, i, currentQualNumberWithPrefix)) {
        console.error(
          'CSV Worker::_validateHeaders: failed to validate additional qualification headers: ',
          additionalQualsHeaders,
        );
        return false;
      }
    }
  }

  return true;
};

const qualificationHeadersIncorrect = (remainingHeaders, i, currentHeaderIndex) =>
  !(remainingHeaders[i] === `QUALACH${currentHeaderIndex}`) ||
  !(remainingHeaders[i + 1] === `QUALACH${currentHeaderIndex}NOTES`);

const getWorkerHeadersWithExtraQuals = (highestNoOfQualsForWorker) => {
  const DEFAULT_NUMBER_OF_QUALS = 3;

  if (highestNoOfQualsForWorker <= DEFAULT_NUMBER_OF_QUALS) return workerHeadersWithoutCHGUNIQUEWRKID;

  const extraHeaders = [];
  for (let qualNumber = DEFAULT_NUMBER_OF_QUALS + 1; qualNumber <= highestNoOfQualsForWorker; qualNumber++) {
    extraHeaders.push(createQualHeader(qualNumber, false));
    extraHeaders.push(createQualHeader(qualNumber, true));
  }

  return workerHeadersWithoutCHGUNIQUEWRKID + ',' + extraHeaders.join(',');
};

const createQualHeader = (qualNumber, isNotesHeader) => {
  const header = `QUALACH${qualNumber.toString().padStart(2, '0')}`;
  return isNotesHeader ? header.concat('NOTES') : header;
};

module.exports = {
  validateWorkerHeaders,
  getWorkerHeadersWithExtraQuals,
  workerHeadersWithCHGUNIQUEWRKID,
  workerHeadersWithoutCHGUNIQUEWRKID,
};

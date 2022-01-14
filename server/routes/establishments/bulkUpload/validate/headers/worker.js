const { workerHeadersWithCHGUNIQUEWRKID, workerHeadersWithoutCHGUNIQUEWRKID } = require('../../data/workerHeaders');

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

const getWorkerHeadersWithExtraQuals = (highestNoOfQuals) => {
  const DEFAULT_NUMBER_OF_QUALS = 3;

  if (highestNoOfQuals <= DEFAULT_NUMBER_OF_QUALS) return workerHeadersWithoutCHGUNIQUEWRKID;

  const extraHeaders = [];
  for (let qualNumber = DEFAULT_NUMBER_OF_QUALS + 1; qualNumber <= highestNoOfQuals; qualNumber++) {
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
};

const models = require('../models');

const dateFormatter = (dateOfBirth) => {
  const dobParts = dateOfBirth ? dateOfBirth.split('-') : null;
  return dobParts ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : '';
};

const createWorkerKey = (localEstablishmentId, workerId) =>
  ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');

const createEstablishmentKey = (establishmentId) => (establishmentId ? establishmentId.replace(/\s/g, '') : '');

const deleteRecord = (APIRecords, lineNumber) => delete APIRecords[lineNumber];

const csvQuote = (toCsv) => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  }

  return toCsv;
};

const hideNinoAndDob = (dataArr, niNumberIndex, dobIndex) => {
  dataArr[niNumberIndex] = dataArr[niNumberIndex] && 'Admin';
  dataArr[dobIndex] = dataArr[dobIndex] && 'Admin';

  return dataArr;
};

const showNinoAndDob = (dataArr, worker, niNumberIndex, dobIndex) => {
  dataArr[niNumberIndex].toLowerCase() === 'admin'
    ? (dataArr[niNumberIndex] = worker.NationalInsuranceNumberValue)
    : dataArr[niNumberIndex];
  dataArr[dobIndex].toLowerCase() === 'admin' ? (dataArr[dobIndex] = worker.DateOfBirthValue) : dataArr[dobIndex];

  return dataArr;
};

const staffData = async (data, downloadType) => {
  const dataRows = data.split('\r\n');

  const niNumberIndex = dataRows[0].split(',').findIndex((element) => element === 'NINUMBER');
  const dobIndex = dataRows[0].split(',').findIndex((element) => element === 'DOB');
  const idIndex = dataRows[0].split(',').findIndex((element) => element === 'UNIQUEWORKERID');

  const updatedData = await Promise.all(
    dataRows.map(async (data, index) => {
      if (index !== 0) {
        const dataArr = data.split(',');
        const workerIdentifier = dataArr[idIndex];
        const worker = await models.worker.findOne({ where: { NameOrIdValue: workerIdentifier } });

        const updatedDataArr =
          downloadType === 'Staff'
            ? showNinoAndDob(dataArr, worker, niNumberIndex, dobIndex)
            : hideNinoAndDob(dataArr, niNumberIndex, dobIndex);

        return '\r\n' + updatedDataArr.join(',');
      }
      return data;
    }),
  );

  return updatedData.join('');
};

module.exports = {
  dateFormatter,
  createWorkerKey,
  createEstablishmentKey,
  deleteRecord,
  csvQuote,
  staffData,
  hideNinoAndDob,
  showNinoAndDob,
};

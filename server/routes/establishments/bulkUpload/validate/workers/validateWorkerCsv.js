'use strict';
const { Worker } = require('../../../../../models/classes/worker');
const { Qualification } = require('../../../../../models/classes/qualification');
const { validateWorkerLambda } = require('../../lambda');
const { dateFormatter } = require('../../../../../utils/bulkUploadUtils');

const validateWorkerCsv = async (workers, myCurrentEstablishments) => {
  console.log('validateWorkerCsv.js - validateWorkerCsv *********');
  const csvWorkerSchemaErrors = [];
  const myAPIWorkers = {};
  const myJSONWorkers = [];

  await Promise.all(
    workers.imported.map((thisLine, currentLineNumber) =>
      validateWorkerCsvLine(
        thisLine,
        currentLineNumber + 2,
        csvWorkerSchemaErrors,
        myAPIWorkers,
        myCurrentEstablishments,
        myJSONWorkers,
      ),
    ),
  );

  return { csvWorkerSchemaErrors, myAPIWorkers, myJSONWorkers };
};

const validateWorkerCsvLine = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myAPIWorkers,
  myCurrentEstablishments,
  myJSONWorkers,
) => {
  console.log('******* validateWorkerCsv.js - validateWorkerCsvLine ******');
  const existingWorker = findExistingWorker(thisLine, myCurrentEstablishments);

  thisLine.NINUMBER = restoreNINumber(thisLine.NINUMBER, existingWorker);
  thisLine.DOB = restoreDOB(thisLine.DOB, existingWorker);

  const { thisWorkerAsAPI, thisWorkerQualificationsAsAPI, thisWorkerAsJSON, validationErrors } =
    await validateWorkerLambda(thisLine, currentLineNumber, existingWorker);

  try {
    const thisApiWorker = new Worker();
    console.log('thisApiWorker', thisApiWorker);
    await thisApiWorker.load(thisWorkerAsAPI);

    if (thisApiWorker.validate()) {
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      await Promise.all(
        thisWorkerQualificationsAsAPI.map((thisQual) => loadWorkerQualifications(thisQual, thisApiWorker)),
      );
    } else if (thisApiWorker.errors.length === 0) {
      myAPIWorkers[currentLineNumber] = thisApiWorker;
    }
  } catch (err) {
    console.error('WA - localised validate workers error until validation card', err);
  }

  csvWorkerSchemaErrors.push(...validationErrors);

  myJSONWorkers.push(thisWorkerAsJSON);
};

const findExistingWorker = (thisLine, myCurrentEstablishments) => {
  const establishmentUniqueID = thisLine.LOCALESTID.replace(/\s/g, '');
  const workerUniqueID = thisLine.UNIQUEWORKERID.replace(/\s/g, '');

  const foundEstablishment = myCurrentEstablishments.find(
    (currentEstablishment) => currentEstablishment.key === establishmentUniqueID,
  );

  if (foundEstablishment) {
    const worker = foundEstablishment.theWorker(workerUniqueID);
    if (worker) {
      return worker.toJSON(true, false);
    }
  }

  return null;
};

const loadWorkerQualifications = async (thisQual, thisApiWorker) => {
  const thisApiQualification = new Qualification();

  await thisApiQualification.load(thisQual);

  thisApiWorker.associateQualification(thisApiQualification);
};

const restoreNINumber = (nINumber, existingWorker) => {
  if (nINumber.toLowerCase() === 'admin') {
    return existingWorker ? existingWorker.nationalInsuranceNumber.currentValue : '';
  } else {
    return nINumber;
  }
};

const restoreDOB = (dob, existingWorker) => {
  if (dob.toLowerCase() === 'admin') {
    return existingWorker ? dateFormatter(existingWorker.dateOfBirth.currentValue) : '';
  } else {
    return dob;
  }
};

module.exports = {
  validateWorkerCsv,
  restoreNINumber,
  restoreDOB,
};

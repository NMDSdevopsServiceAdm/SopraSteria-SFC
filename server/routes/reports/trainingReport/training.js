// Local Authority user's report
'use strict';

// external node modules
const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const JsZip = require('jszip');
const config = require('../../../../server/config/config');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const { Establishment } = require('../../../models/classes/establishment');
const { getTrainingData, getJobName } = rfr('server/data/trainingReport');
const { attemptToAcquireLock, updateLockState, lockStatus, releaseLockQuery } = rfr('server/data/trainingReportLock');

// Constants string needed by this file in several places
const folderName = 'template';
const overviewSheetName = path.join('xl', 'worksheets', 'sheet1.xml');
const trainingsSheetName = path.join('xl', 'worksheets', 'sheet2.xml');
const sharedStringsName = path.join('xl', 'sharedStrings.xml');
const schema = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const isNumberRegex = /^[0-9]+(\.[0-9]+)?$/;

const debuglog = () => {};
const buStates = ['READY', 'DOWNLOADING', 'FAILED', 'WARNINGS', 'PASSED', 'COMPLETING'].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

const trainingCounts = {
  expiredTrainingCount: 0,
  expiringTrainingCount: 0,
  missingMandatoryTrainingCount: 0,
  missingExpiringMandatoryTrainingCount: 0,
};

let expiredWorkerTrainings = [];
let expiringWorkerTrainings = [];

// XML DOM manipulation helper functions
const { DOMParser, XMLSerializer } = new (require('jsdom').JSDOM)().window;

const parseXML = fileContent => new DOMParser().parseFromString(fileContent.toString('utf8'), 'application/xml');

const serializeXML = dom =>
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + new XMLSerializer().serializeToString(dom);

/**
 * Helper function to set a spreadsheet cell's value
 *
 * @param {Document} sheetDoc
 * @param {Document} stringsDoc
 * @param {Element} sst
 * @param {Array} sharedStringsUniqueCount
 * @param {Element} element
 * @param {String} value
 */
const putStringTemplate = (sheetDoc, stringsDoc, sst, sharedStringsUniqueCount, sharedStringsCount, element, value) => {
  let vTag = element.querySelector('v');
  const hasVTag = vTag !== null;
  const textValue = String(value);
  const isNumber = isNumberRegex.test(textValue);

  if (!hasVTag) {
    vTag = sheetDoc.createElementNS(schema, 'v');

    element.appendChild(vTag);
  }

  if (isNumber) {
    element.removeAttribute('t');
    vTag.textContent = textValue;
  } else {
    element.setAttribute('t', 's');

    const si = stringsDoc.createElementNS(schema, 'si');
    const t = stringsDoc.createElementNS(schema, 't');

    sst.appendChild(si);
    si.appendChild(t);

    t.textContent = textValue;
    vTag.textContent = sharedStringsUniqueCount[0];
    sharedStringsCount[0] += 1;
    sharedStringsUniqueCount[0] += 1;
  }
};

/**
 * Function used to retrieve training report data
 *
 * @param {Date} date
 * @param {Object} thisEstablishment
 * @return {Object} All training report data
 */
const getReportData = async (date, thisEstablishment) => {
  debuglog('training excel report data started:', thisEstablishment);

  return {
    date: date.toISOString(),
    trainings: await getTrainingReportData(thisEstablishment.id),
  };
};

const updateProps = 'JobName,Category,Title,Expires,Accredited'.split(',');

/**
 * Helper Function used to create expired/expiring traing data
 *
 * @param {Object} trainingData
 * @param {Object} All customized expired/expiring training report data
 */
const createExpireExpiringData = async (trainingData, reportData) => {
  if (trainingData.length && trainingData.length > 0) {
    trainingData.forEach(async value => {
      if (reportData.length === 0) {
        reportData.push({ ID: value.ID, NameOrIdValue: value.NameOrIdValue, Count: 0 });
      } else {
        let foundTrn = false;
        reportData.forEach(async (worker, key) => {
          if (worker.ID === value.ID) {
            foundTrn = true;
          }
        });
        if (!foundTrn) {
          reportData.push({ ID: value.ID, NameOrIdValue: value.NameOrIdValue, Count: 0 });
        }
      }
    });
  }
};

/**
 * Function used to customize training report data
 *
 * @param {number} establishmentId
 * @return {Object} All customized training report data
 */
const getTrainingReportData = async establishmentId => {
  expiredWorkerTrainings = [];
  expiringWorkerTrainings = [];
  const trainingData = await getTrainingData(establishmentId);
  await createExpireExpiringData(trainingData, expiredWorkerTrainings);
  await createExpireExpiringData(trainingData, expiringWorkerTrainings);
  trainingCounts.expiredTrainingCount = 0;
  trainingCounts.expiringTrainingCount = 0;
  if (expiredWorkerTrainings.length > 0 && expiringWorkerTrainings.length > 0) {
    for(let i = 0; i < trainingData.length; i++){
      trainingData[i].Title = trainingData[i].Title.replace(/%20/g, " ");
      trainingData[i].Completed = trainingData[i].Completed === null? '': trainingData[i].Completed;
      let jobNameResult = await getJobName(trainingData[i].MainJobFKValue);
      if(jobNameResult && jobNameResult.length > 0){
        trainingData[i].JobName = jobNameResult[0].JobName;
      }else{
        trainingData[i].JobName = 'Missing';
      }
      if (trainingData[i].Expires && trainingData[i].Expires !== null) {
        let expiringDate = moment(trainingData[i].Expires);
        let currentDate = moment();
        if (currentDate > expiringDate) {
          trainingCounts.expiredTrainingCount++;
          trainingData[i].Status = 'Expired';
          //create expired workers data
          expiredWorkerTrainings.forEach(async worker => {
            if (worker.ID === trainingData[i].ID) {
              worker.Count++;
            }
          });
        } else if (expiringDate.diff(currentDate, 'days') <= 90) {
          trainingCounts.expiringTrainingCount++;
          trainingData[i].Status = 'Expiring soon';
          //create expiring workers data
          expiringWorkerTrainings.forEach(worker => {
            if (worker.ID === trainingData[i].ID) {
              worker.Count++;
            }
          });
        } else {
          trainingData[i].Status = 'Up-to-date';
        }
      } else {
        trainingData[i].Status = 'Missing';
      }
      updateProps.forEach(prop => {
        if (trainingData[i][prop] === null) {
          trainingData[i][prop] = 'Missing';
        }
      });
    }
  }
  return trainingData;
};

/**
 * Define styles for sheet columns
 */
const styleLookup = {
  BLACK: {
    OVRREGULAR: {
      A: 2,
      B: 6,
      C: 2,
      // D: 2,
      // E: 2,
      D: 2,
      E: 2,
      F: 11,
      // G: 1,
      H: 12,
      I: 12,
      J: 12,
    },
    OVRLAST: {
      A: 2,
      B: 16,
      C: 2,
      // D: 2,
      // E: 2,
      D: 2,
      E: 2,
      F: 21,
      //G: 22,
      H: 22,
      I: 22,
      J: 22,
    },
    TRNREGULAR: {
      A: 8,
      B: 8,
      C: 8,
      D: 8,
      E: 55,
      //F: 7,
      F: 8,
      G: 8,
      H: 7,
    },
    TRNLAST: {
      A: 9,
      B: 9,
      C: 9,
      D: 9,
      E: 56,
      //F: 13,
      F: 9,
      G: 9,
      H: 7,
    },
  },
  RED: {
    OVRREGULAR: {
      A: 2,
      B: 6,
      C: 7,
      // D: 67,
      // E: 9,
      D: 67,
      E: 9,
      F: 65,
      G: 11,
      H: 21,
      I: 12,
      J: 66,
    },
    OVRLAST: {
      A: 2,
      B: 16,
      C: 17,
      // D: 67,
      // E: 19,
      D: 67,
      E: 19,
      F: 66,
      G: 22,
      H: 22,
      I: 66,
      J: 66,
    },
    TRNREGULAR: {
      A: 10,
      B: 10,
      C: 10,
      D: 10,
      E: 10,
      //F: 12,
      F: 10,
      G: 10,
      H: 12,
    },
    TRNLAST: {
      A: 11,
      B: 11,
      C: 11,
      D: 11,
      E: 11,
      //F: 13,
      F: 11,
      G: 11,
      H: 13,
    },
  },
};
/**
 * Helper function used to set column's font style
 *
 * @param {Document} cellToChange
 * @param {String} columnText
 * @param {String} rowType
 * @param {Boolean} isRed
 */
const setStyle = (cellToChange, columnText, rowType, isRed) => {
  cellToChange.setAttribute('s', styleLookup[isRed ? 'RED' : 'BLACK'][rowType][columnText]);
};
/**
 * Helper function used to set column's font style according to column value
 *
 * @param {Function} putString
 * @param {Document} cellToChange
 * @param {String} value
 * @param {String} columnText
 * @param {String} rowType
 * @param {Boolean} percentColumn
 */
const basicValidationUpdate = (putString, cellToChange, value, columnText, rowType) => {
  let isRed = false;
  const stringValue = String(value);

  if (stringValue === 'Missing') {
    isRed = true;
  }

  putString(cellToChange, value);

  setStyle(cellToChange, columnText, rowType, isRed);
};
/**
 * Function used to create columns for overview sheet tab and then push data into those columns
 *
 * @param {Document} overviewSheet
 * @param {Object} reportData
 * @param {String} sharedStrings
 * @param {Element} sst
 * @param {Number} sharedStringsUniqueCount
 * @return {Document} overviewSheet
 */
const updateOverviewSheet = (
  overviewSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount,
  sharedStringsCount
) => {
  debuglog('updating overview sheet');

  const putString = putStringTemplate.bind(
    null,
    overviewSheet,
    sharedStrings,
    sst,
    sharedStringsUniqueCount,
    sharedStringsCount
  );
  // put total expired training count
  putString(overviewSheet.querySelector("c[r='D5']"), trainingCounts.expiredTrainingCount);

  putString(
    overviewSheet.querySelector("c[r='G5']"),
    `You have ${trainingCounts.expiredTrainingCount} expired training counts`
  );
  overviewSheet.querySelector("c[r='G5']").setAttribute('s', 24);

  // put total expiring soon training count
  putString(overviewSheet.querySelector("c[r='D6']"), trainingCounts.expiringTrainingCount);
  putString(
    overviewSheet.querySelector("c[r='G7']"),
    `You have ${trainingCounts.expiringTrainingCount} records expiring soon`
  );
  overviewSheet.querySelector("c[r='G7']").setAttribute('s', 27);

  // put total expiring soon/expired training count
  putString(
    overviewSheet.querySelector("c[r='D7']"),
    `${trainingCounts.expiredTrainingCount + trainingCounts.expiringTrainingCount}`
  );

  putString(
    overviewSheet.querySelector("c[r='G9']"),
    `You have ${trainingCounts.expiredTrainingCount +
      trainingCounts.expiringTrainingCount} staff members with expired or`
  );
  overviewSheet.querySelector("c[r='G9']").setAttribute('s', 30);

  putString(overviewSheet.querySelector("c[r='G10']"), `expiring training counts`);
  overviewSheet.querySelector("c[r='G10']").setAttribute('s', 30);

  //put all expiring traing details
  let currentRowBottom = overviewSheet.querySelector("row[r='17']");
  let rowIndexBottom = 17;
  let updateRowIndex = rowIndexBottom + expiringWorkerTrainings.length - 1;

  for (; rowIndexBottom >= 13; rowIndexBottom--, updateRowIndex--) {
    if (rowIndexBottom === 17) {
      // fix the dimensions tag value
      const dimension = overviewSheet.querySelector('dimension');
      dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + updateRowIndex);
    }

    currentRowBottom.querySelectorAll('c').forEach(elem => {
      elem.setAttribute('r', String(elem.getAttribute('r')).replace(/\d+$/, '') + updateRowIndex);
    });

    currentRowBottom.setAttribute('r', updateRowIndex);

    while (currentRowBottom.previousSibling !== null) {
      currentRowBottom = currentRowBottom.previousSibling;

      if (currentRowBottom.nodeName === 'row') {
        break;
      }
    }
  }

  let bottomRowIndex = 17 + expiringWorkerTrainings.length - 1;
  const templateRowExpiring = overviewSheet.querySelector(`row[r='${bottomRowIndex}']`);
  let currentRowExpiring = templateRowExpiring;
  let rowIndexExpiring = bottomRowIndex + 1;
  if (expiringWorkerTrainings.length > 0) {
    for (let i = 0; i < expiringWorkerTrainings.length - 1; i++) {
      const tempRowBottom = templateRowExpiring.cloneNode(true);
      tempRowBottom.setAttribute('r', rowIndexExpiring);

      tempRowBottom.querySelectorAll('c').forEach(elem => {
        elem.setAttribute('r', String(elem.getAttribute('r')).replace(/\d+$/, '') + rowIndexExpiring);
      });

      templateRowExpiring.parentNode.insertBefore(tempRowBottom, currentRowExpiring.nextSibling);
      currentRowExpiring = tempRowBottom;
      rowIndexExpiring++;
    }

    currentRowExpiring = templateRowExpiring;
  }

  // fix the dimensions tag value
  const dimension = overviewSheet.querySelector('dimension');
  dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + rowIndexExpiring);

  // update the cell values
  for (let row = 0; row < expiringWorkerTrainings.length; row++) {
    debuglog('updating training sheet', row);
    const rowType = row === expiringWorkerTrainings.length - 1 ? 'OVRLAST' : 'OVRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 8; column++) {
      const columnText = String.fromCharCode(column + 65);

      const cellToChange =
        typeof nextSibling.querySelector === 'function'
          ? nextSibling
          : currentRowExpiring.querySelector(`c[r='${columnText}${row + bottomRowIndex}']`);
      switch (columnText) {
        case 'C':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              expiringWorkerTrainings[row].NameOrIdValue,
              columnText,
              rowType
            );
          }
          break;
        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, expiringWorkerTrainings[row].Count, columnText, rowType);
          }
          break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRowExpiring = currentRowExpiring.nextSibling;
  }

  //put all expired training details
  // clone the row the apropriate number of times
  const templateRow = overviewSheet.querySelector("row[r='12']");
  let currentRow = templateRow;
  let rowIndex = 13;
  if (expiredWorkerTrainings.length > 0) {
    for (let i = 0; i < expiredWorkerTrainings.length - 1; i++) {
      const tempRow = templateRow.cloneNode(true);
      tempRow.setAttribute('r', rowIndex);

      tempRow.querySelectorAll('c').forEach(elem => {
        elem.setAttribute('r', String(elem.getAttribute('r')).replace(/\d+$/, '') + rowIndex);
      });

      templateRow.parentNode.insertBefore(tempRow, currentRow.nextSibling);
      currentRow = tempRow;
      rowIndex++;
    }

    currentRow = templateRow;
  }

  // update the cell values
  for (let row = 0; row < expiredWorkerTrainings.length; row++) {
    debuglog('updating training sheet', row);
    const rowType = row === expiredWorkerTrainings.length - 1 ? 'OVRLAST' : 'OVRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 10; column++) {
      const columnText = String.fromCharCode(column + 65);

      const cellToChange =
        typeof nextSibling.querySelector === 'function'
          ? nextSibling
          : currentRow.querySelector(`c[r='${columnText}${row + 12}']`);
      switch (columnText) {
        case 'C':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              expiredWorkerTrainings[row].NameOrIdValue,
              columnText,
              rowType
            );
          }
          break;
        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, expiredWorkerTrainings[row].Count, columnText, rowType);
          }
          break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog('overview updated');

  return overviewSheet;
};
/**
 * Function used to create columns for training view sheet tab and then push data into those columns
 *
 * @param {Document} trainingsSheet
 * @param {Object} reportData
 * @param {String} sharedStrings
 * @param {Element} sst
 * @param {Number} sharedStringsUniqueCount
 * @return {Document} overviewSheet
 */
const updateTrainingsSheet = (
  trainingsSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount,
  sharedStringsCount
) => {
  debuglog('updating trainings sheet');

  const putString = putStringTemplate.bind(
    null,
    trainingsSheet,
    sharedStrings,
    sst,
    sharedStringsUniqueCount,
    sharedStringsCount
  );

  // clone the row the apropriate number of times
  const templateRow = trainingsSheet.querySelector("row[r='7']");
  let currentRow = templateRow;
  let rowIndex = 8;
  let trainingArray = reportData.trainings;
  if (trainingArray.length > 1) {
    for (let i = 0; i < trainingArray.length - 1; i++) {
      const tempRow = templateRow.cloneNode(true);

      tempRow.setAttribute('r', rowIndex);

      tempRow.querySelectorAll('c').forEach(elem => {
        elem.setAttribute('r', String(elem.getAttribute('r')).replace(/\d+$/, '') + rowIndex);
      });

      templateRow.parentNode.insertBefore(tempRow, currentRow.nextSibling);
      currentRow = tempRow;
      rowIndex++;
    }

    currentRow = templateRow;
  }

  // fix the last row in the table
  trainingsSheet.querySelector('sheetData row:last-child').setAttribute('r', rowIndex);

  // fix the dimensions tag value
  const dimension = trainingsSheet.querySelector('dimension');
  dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + rowIndex);

  // update the cell values
  for (let row = 0; row < trainingArray.length; row++) {
    debuglog('updating training sheet', row);

    const rowType = row === trainingArray.length - 1 ? 'TRNLAST' : 'TRNREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 9; column++) {
      const columnText = String.fromCharCode(column + 65);
      const isRed = false;

      const cellToChange =
        typeof nextSibling.querySelector === 'function'
          ? nextSibling
          : currentRow.querySelector(`c[r='${columnText}${row + 7}']`);
      switch (columnText) {
        case 'A':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].NameOrIdValue, columnText, rowType);
          }
          break;

        case 'B':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].JobName, columnText, rowType);
          }
          break;

        case 'C':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].Category, columnText, rowType);
          }
          break;

        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].Title, columnText, rowType);
          }
          break;

        case 'E':
          {
            putString(trainingsSheet.querySelector(`c[r='${columnText}${row + 7}']`), trainingArray[row].Status);
            let styleCol;
            if (trainingArray[row].Status === 'Up-to-date') {
              styleCol = 19;
            } else if (trainingArray[row].Status === 'Expired') {
              styleCol = 20;
            } else if (trainingArray[row].Status === 'Expiring soon') {
              styleCol = 21;
            } else {
              styleCol = 20;
            }
            trainingsSheet.querySelector(`c[r='${columnText}${row + 7}']`).setAttribute('s', styleCol);
          }
          break;

        case 'F':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].ExpiredOn, columnText, rowType);
          }
          break;

        case 'G':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].Completed, columnText, rowType);
          }
          break;

        case 'H':
          {
            basicValidationUpdate(putString, cellToChange, trainingArray[row].Accredited, columnText, rowType);
          }
          break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog('trainings updated');

  return trainingsSheet;
};
/**
 * Function used to generate reports data first and then read all related xml files, parse them,
 * push data into them and then create a zipped file including all reports related sheets
 *
 * @param {Date} date
 * @param {Object} thisEstablishment
 */
const getReport = async (date, thisEstablishment) => {
  const reportData = await getReportData(date, thisEstablishment);

  if (reportData === null) {
    return null;
  }

  return new Promise(resolve => {
    const thePath = path.join(__dirname, folderName);
    const walker = walk.walk(thePath);
    const outputZip = new JsZip();

    let overviewSheet, trainingsSheet, sharedStrings;

    debuglog('iterating filesystem', thePath);

    walker.on('file', (root, fileStats, next) => {
      const pathName = root
        .replace(thePath, '')
        .replace('\\', '/')
        .replace(/^\//, '');
      const zipPath = pathName === '' ? fileStats.name : path.join(pathName, fileStats.name);
      const readPath = path.join(thePath, zipPath);
      debuglog('file found', readPath);

      fs.readFile(`${readPath}`, (err, fileContent) => {
        debuglog('content read', zipPath);

        if (!err) {
          switch (zipPath) {
            case overviewSheetName:
              {
                overviewSheet = parseXML(fileContent);
              }
              break;

            case trainingsSheetName:
              {
                trainingsSheet = parseXML(fileContent);
              }
              break;

            case sharedStringsName:
              {
                sharedStrings = parseXML(fileContent);
              }
              break;

            default:
              {
                outputZip.file(zipPath, fileContent);
              }
              break;
          }
        }

        next();
      });
    });

    walker.on('end', () => {
      debuglog('all files read');

      if (sharedStrings) {
        const sst = sharedStrings.querySelector('sst');

        const sharedStringsUniqueCount = [parseInt(sst.getAttribute('uniqueCount'), 10)];
        const sharedStringsCount = [parseInt(sst.getAttribute('count'), 10)];

        // update the overview sheet with the report data and add it to the zip
        outputZip.file(
          overviewSheetName,
          serializeXML(
            updateOverviewSheet(
              overviewSheet,
              reportData,
              sharedStrings,
              sst,
              sharedStringsUniqueCount, // pass unique count by reference rather than by value
              sharedStringsCount
            )
          )
        );

        //outputZip.file(establishmentsSheetName, serializeXML(establishmentsSheet));
        //outputZip.file(trainingsSheetName, serializeXML(updateTrainingsSheet));

        // update the trainings sheet with the report data and add it to the zip
        outputZip.file(
          trainingsSheetName,
          serializeXML(
            updateTrainingsSheet(
              trainingsSheet,
              reportData,
              sharedStrings,
              sst,
              sharedStringsUniqueCount, // pass unique count by reference rather than by value
              sharedStringsCount
            )
          )
        );

        // update the shared strings counts we've been keeping track of
        sst.setAttribute('uniqueCount', sharedStringsUniqueCount[0]);
        sst.setAttribute('count', sharedStringsCount[0]);

        // add the updated shared strings to the zip
        outputZip.file(sharedStringsName, serializeXML(sharedStrings));
      }

      debuglog('training report: creating zip file');

      resolve(outputZip);
    });
  }).then(outputZip =>
    outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
  );
};

// Prevent multiple training report requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const acquireLock = async function(logic, newState, req, res) {
  const { establishmentId } = req;

  req.startTime = new Date().toISOString();

  console.log(`Acquiring lock for establishment ${establishmentId}.`);

  // attempt to acquire the lock
  const currentLockState = await attemptToAcquireLock(establishmentId);

  // if no records were updated the lock could not be acquired
  // Just respond with a 409 http code and don't call the regular logic
  // close the response either way and continue processing in the background
  if (currentLockState[1] === 0) {
    console.log('Lock *NOT* acquired.');
    res.status(409).send({
      message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`,
    });

    return;
  }

  console.log('Lock acquired.', newState);

  let nextState;

  switch (newState) {
    case buStates.DOWNLOADING:
      {
        // get the current training report state
        const currentState = await lockStatus(establishmentId);

        if (currentState.length === 1) {
          // don't update the status for downloads, just hold the lock
          newState = currentState[0].TrainingReportState;
          nextState = null;
        } else {
          nextState = buStates.READY;
        }
      }
      break;

    case buStates.COMPLETING:
      nextState = buStates.READY;
      break;

    default:
      newState = buStates.READY;
      nextState = buStates.READY;
      break;
  }

  // update the current state
  await updateLockState(establishmentId, newState);

  req.buRequestId = String(uuid()).toLowerCase();

  res.status(200).send({
    message: `Lock for establishment ${establishmentId} acquired.`,
    requestId: req.buRequestId,
  });

  // run whatever the original logic was
  try {
    await logic(req, res);
  } catch (e) {}

  // release the lock
  await releaseLock(req, null, null, nextState);
};

const releaseLock = async (req, res, next, nextState = null) => {
  const establishmentId = req.query.subEstId || req.establishmentId;

  if (Number.isInteger(establishmentId)) {
    await releaseLockQuery(establishmentId, nextState);

    console.log(`Lock released for establishment ${establishmentId}`);
  }

  if (res !== null) {
    res.status(200).send({
      establishmentId,
    });
  }
};

const signedUrlGet = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    await saveResponse(req, res, 200, {
      urls: s3.getSignedUrl('putObject', {
        Bucket,
        Key: `${establishmentId}/latest/${moment(date).format('YYYY-MM-DD')}-SFC-Training-Report.xlsx`,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Metadata: {
          username: String(req.username),
          establishmentId: String(establishmentId),
        },
        Expires: config.get('bulkupload.uploadSignedUrlExpire'),
      }),
    });
  } catch (err) {
    console.error('report/training:PreSigned - failed', err.message);
    await saveResponse(req, res, 503, {});
  }
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3
    .putObject({
      Bucket,
      Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
      Body: JSON.stringify({
        url: req.url,
        startTime: req.startTime,
        endTime: new Date().toISOString(),
        responseCode: statusCode,
        responseBody: body,
        responseHeaders: typeof headers === 'object' ? headers : undefined,
      }),
    })
    .promise();
};

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid',
    });

    return;
  }

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`,
  })
    .promise()
    .then(data => {
      const jsonData = JSON.parse(data.Body.toString());

      if (Number.isInteger(jsonData.responseCode) && jsonData.responseCode > 99) {
        if (jsonData.responseHeaders) {
          res.set(jsonData.responseHeaders);
        }

        if (jsonData.responseBody && jsonData.responseBody.type && jsonData.responseBody.type === 'Buffer') {
          res.status(jsonData.responseCode).send(Buffer.from(jsonData.responseBody));
        } else {
          res.status(jsonData.responseCode).send(jsonData.responseBody);
        }
      } else {
        console.log('TrainingReport::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch(err => {
      console.log('TrainingReport::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found',
      });
    });
};

const lockStatusGet = async (req, res) => {
  const { establishmentId } = req;

  const currentLockState = await lockStatus(establishmentId);

  res
    .status(200) // don't allow this to be able to test if an establishment exists so always return a 200 response
    .send(
      currentLockState.length === 0
        ? {
            establishmentId,
            TrainingReportState: buStates.READY,
            TrainingReportdLockHeld: true,
          }
        : currentLockState[0]
    );

  return currentLockState[0];
};

const reportGet = async (req, res) => {
  try {
    // first ensure this report can only be run by those establishments that are a parent
    const thisEstablishment = new Establishment(req.username);

    if (await thisEstablishment.restore(req.establishment.id, false)) {
      const date = new Date();
      const report = await getReport(date, thisEstablishment);

      if (report) {
        await saveResponse(req, res, 200, report, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-disposition': `attachment; filename=${moment(date).format('YYYY-MM-DD')}-SFC-Training-Report.xlsx`,
        });
        console.log('report/training - 200 response');
      } else {
        // only allow on those establishments being a parent

        console.log('report/training 403 response');
        await saveResponse(req, res, 403, {});
      }
    } else {
      console.error('report/training - failed restoring establisment');
      await saveResponse(req, res, 503, {});
    }
  } catch (err) {
    console.error('report/training - failed', err);
    await saveResponse(req, res, 503, {});
  }
};

// gets report
// NOTE - the Local Authority report is driven mainly by pgsql (postgres functions) and therefore does not
//    pass through the Establishment/Worker entities. This is done for performance, as these reports
//    are expected to operate across large sets of data

/**
 * Handle GET API requests to get Training report data
 */

router.route('/signedUrl').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING));
router.route('/report').get(acquireLock.bind(null, reportGet, buStates.DOWNLOADING));
router.route('/lockstatus').get(lockStatusGet);
router.route('/unlock').get(releaseLock);
router.route('/response/:buRequestId').get(responseGet);

module.exports = router;

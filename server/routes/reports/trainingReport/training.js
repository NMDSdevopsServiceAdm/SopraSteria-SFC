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
const models = require('../../../../server/models');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const cheerio = require('cheerio');

const s3 = new AWS.S3({
  region: String(config.get('bulkupload.region')),
});
const Bucket = String(config.get('bulkupload.bucketname'));

const Training = require('../../../models/classes/training').Training;
const { getTrainingData, getJobName, getMndatoryTrainingDetails } = rfr('server/data/trainingReport');
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
  expiredMandatoryTrainingCount: 0,
  expiredNonMandatoryTrainingCount: 0,
  expiringMandatoryTrainingCount: 0,
  expiringNonMandatoryTrainingCount: 0,
  upToDateTrainingCount: 0,
  upToDateMandatoryTrainingCount: 0,
  upToDateNonMandatoryTrainingCount: 0
};

let expiredWorkerTrainings = [];
let expiringWorkerTrainings = [];
let missingMandatoryTrainingRecords = [];
let expiredOrExpiringWorkerRecords = [];

const parseXML = fileContent =>
  cheerio.load(fileContent, {
    xml: {
      normalizeWhitespace: true,
    }
  });

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
  let vTag = element.children('v').first();
  let hasVTag = true;
  if (element.children('v').length === 0) {
    hasVTag = false;
  }

  const textValue = String(value);
  const isNumber = isNumberRegex.test(textValue);

  if (!hasVTag) {
    vTag = sheetDoc('<v></v>');
    vTag.text(sharedStringsUniqueCount[0]);

    element.append(vTag);
  } else {
    vTag.text(sharedStringsUniqueCount[0]);
  }

  if (isNumber) {
    element.attr('t', '');
    vTag.text(textValue);
  } else {
    element.attr('t', 's');

    const si = stringsDoc('<si></si>');
    const t = stringsDoc('<t></t>');
    t.text(textValue);

    sst.append(si);
    si.append(t);

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
    trainings: await getTrainingReportData(thisEstablishment),
  };
};

const updateProps = 'JobName,Category,Title,Expires'.split(',');

/**
 * Helper Function used to create expired/expiring traing data
 *
 * @param {Object} trainingData
 * @param {Object} All customized expired/expiring training report data
 */
const createExpireExpiringData = async (trainingData) => {
  return trainingData.filter((trainingWorker, index, self) => self.findIndex(t => trainingWorker.ID === t.ID) === index).map(
    training => {
      return {ID: training.ID, NameOrIdValue: training.NameOrIdValue, MandatoryCount: 0, NonMandatoryCount: 0, Count: 0}
    }
  );

};

/**
 * Function used to customize training report data
 *
 * @param {number} establishmentId
 * @return {Object} All customized training report data
 */
const getTrainingReportData = async establishmentId => {
  missingMandatoryTrainingRecords = [];
  const trainingData = await getTrainingData(establishmentId);
  expiredWorkerTrainings = await createExpireExpiringData(trainingData);
  expiringWorkerTrainings = await createExpireExpiringData(trainingData);
  const allWorkers = await models.worker.findAll({
    attributes: ['id', 'uid', 'NameOrIdValue'],
    where:{
      establishmentFk: establishmentId,
      archived: false
    },
    include: [
      {
        model: models.job,
        as: 'mainJob',
        attributes: ['id', 'title']
      }
    ]
  });
  if(allWorkers && allWorkers.length > 0){
    for(let i = 0; i < allWorkers.length; i++){
      const allTrainingRecords = await Training.fetch(establishmentId, allWorkers[i].uid, null);
      if(allTrainingRecords){
        allWorkers[i].missingMandatoryTrainingCount = await Training.getAllMissingMandatoryTrainingCounts(establishmentId, allWorkers[i], allTrainingRecords.training);
      }
    }
  }
  missingMandatoryTrainingRecords = allWorkers;
  trainingCounts.expiredTrainingCount = 0;
  trainingCounts.expiringTrainingCount = 0;
  trainingCounts.upToDateTrainingCount = 0;
  trainingCounts.expiredMandatoryTrainingCount = 0;
  trainingCounts.expiredNonMandatoryTrainingCount = 0;
  trainingCounts.expiringMandatoryTrainingCount = 0;
  trainingCounts.expiringNonMandatoryTrainingCount = 0;
  trainingCounts.upToDateMandatoryTrainingCount = 0;
  trainingCounts.upToDateNonMandatoryTrainingCount = 0;
  if (expiredWorkerTrainings.length > 0 && expiringWorkerTrainings.length > 0) {
    for(let i = 0; i < trainingData.length; i++){
      let mandatoryTrainingDetails = await getMndatoryTrainingDetails(trainingData[i], establishmentId);
      if(mandatoryTrainingDetails && +mandatoryTrainingDetails[0].count !== 0){
        trainingData[i].MandatoryTraining = 'Yes';
      }else{
        trainingData[i].MandatoryTraining = 'No';
      }
      trainingData[i].Title = (trainingData[i].Title === null)? '': unescape(trainingData[i].Title);
      trainingData[i].Completed = trainingData[i].Completed === null? '': trainingData[i].Completed;
      trainingData[i].Accredited = trainingData[i].Accredited === null? '': trainingData[i].Accredited;
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
          if(trainingData[i].MandatoryTraining === 'Yes'){
            trainingCounts.expiredMandatoryTrainingCount++;
          }else{
            trainingCounts.expiredNonMandatoryTrainingCount++;
          }
          trainingCounts.expiredTrainingCount++;
          trainingData[i].Status = 'Expired';
          //create expired workers data
          expiredWorkerTrainings.forEach(async worker => {
            if (worker.ID === trainingData[i].ID) {
              if(trainingData[i].MandatoryTraining === 'Yes'){
                worker.MandatoryCount++;
              }else{
                worker.NonMandatoryCount++;
              }
              worker.Count++;
            }
          });
        } else if (expiringDate.diff(currentDate, 'days') <= 90) {
          if(trainingData[i].MandatoryTraining === 'Yes'){
            trainingCounts.expiringMandatoryTrainingCount++;
          }else{
            trainingCounts.expiringNonMandatoryTrainingCount++;
          }
          trainingCounts.expiringTrainingCount++;
          trainingData[i].Status = 'Expiring soon';
          //create expiring workers data
          expiringWorkerTrainings.forEach(worker => {
            if (worker.ID === trainingData[i].ID) {
              if(trainingData[i].MandatoryTraining === 'Yes'){
                worker.MandatoryCount++;
              }else{
                worker.NonMandatoryCount++;
              }
              worker.Count++;
            }
          });
        } else {
          trainingData[i].Status = 'Up-to-date';
          trainingCounts.upToDateTrainingCount++;
          if(trainingData[i].MandatoryTraining === 'Yes'){
            trainingCounts.upToDateMandatoryTrainingCount++;
          }else{
            trainingCounts.upToDateNonMandatoryTrainingCount++;
          }
        }
      } else {
        trainingData[i].Status = 'Up-to-date';
        trainingCounts.upToDateTrainingCount++;
        if(trainingData[i].MandatoryTraining === 'Yes'){
          trainingCounts.upToDateMandatoryTrainingCount++;
        }else{
          trainingCounts.upToDateNonMandatoryTrainingCount++;
        }
        trainingData[i].ExpiredOn = '';
      }
      updateProps.forEach(prop => {
        if (trainingData[i][prop] === null) {
          trainingData[i][prop] = 'Missing';
        }
      });
    }

    expiredWorkerTrainings = expiredWorkerTrainings.filter(item => item.Count !==0);
    expiringWorkerTrainings = expiringWorkerTrainings.filter(item => item.Count !==0);
    missingMandatoryTrainingRecords = missingMandatoryTrainingRecords.filter(item => item.missingMandatoryTrainingCount !==0);
    let expiredOrExpiringWorkerIds = new Set(expiredWorkerTrainings.map(d => d.ID));
    expiredOrExpiringWorkerRecords = [...expiredWorkerTrainings, ...expiringWorkerTrainings.filter(d => !expiredOrExpiringWorkerIds.has(d.ID))];
  }else{
    expiredOrExpiringWorkerRecords = [];
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
      B: 2,
      C: 2,
      D: 2,
      E: 2,
      F: 2,
      G: 2,
      H: 11,
      // G: 1,
      I: 12,
      J: 12,
      K: 12,
      L: 12,
    },
    OVRLAST: {
      A: 2,
      B: 2,
      C: 2,
      D: 2,
      E: 2,
      F: 2,
      G: 2,
      H: 21,
      //G: 22,
      I: 22,
      J: 22,
      K: 22,
      L: 22,
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
      H: 6,
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
      B: 2,
      C: 2,
      D: 2,
      E: 9,
      F: 67,
      G: 9,
      H: 65,
      I: 11,
      J: 21,
      K: 12,
      L: 66,
    },
    OVRLAST: {
      A: 2,
      B: 2,
      C: 2,
      D: 2,
      E: 19,
      F: 67,
      G: 19,
      H: 66,
      I: 22,
      J: 22,
      K: 66,
      L: 66,
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
  cellToChange.attr('s', styleLookup[isRed ? 'RED' : 'BLACK'][rowType][columnText]);
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
 * @param {String} sharedStrings
 * @param {Element} sst
 * @param {Number} sharedStringsUniqueCount
 * @return {Document} overviewSheet
 */
const updateOverviewSheet = (
  overviewSheet,
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
  // put total expired mandatory training count
  putString(overviewSheet("c[r='B3']"), trainingCounts.expiredMandatoryTrainingCount);
  // put total expired non mandatory training count
  putString(overviewSheet("c[r='C3']"), trainingCounts.expiredNonMandatoryTrainingCount);
  // put total expired training count
  putString(overviewSheet("c[r='D3']"), trainingCounts.expiredTrainingCount);
  // put total up-to-date mandatory training count
  putString(overviewSheet("c[r='B2']"), trainingCounts.upToDateMandatoryTrainingCount);
  // put total up-to-date non mandatory training count
  putString(overviewSheet("c[r='C2']"), trainingCounts.upToDateNonMandatoryTrainingCount);
  // put total up-to-date training count
  putString(overviewSheet("c[r='D2']"), trainingCounts.upToDateTrainingCount);

  // put total expiring soon mandatory training count
  putString(overviewSheet("c[r='B4']"), trainingCounts.expiringMandatoryTrainingCount);
  // put total expiring soon non mandatory training count
  putString(overviewSheet("c[r='C4']"), trainingCounts.expiringNonMandatoryTrainingCount);
  // put total expiring soon training count
  putString(overviewSheet("c[r='D4']"), trainingCounts.expiringTrainingCount);

  // put total expiring soon/expired mandatory training count
  putString(
    overviewSheet("c[r='B5']"),
    `${trainingCounts.expiredMandatoryTrainingCount + trainingCounts.expiringMandatoryTrainingCount + trainingCounts.upToDateMandatoryTrainingCount}`
  );

  // put total expiring soon/expired non mandatory training count
  putString(
    overviewSheet("c[r='C5']"),
    `${trainingCounts.expiredNonMandatoryTrainingCount + trainingCounts.expiringNonMandatoryTrainingCount + trainingCounts.upToDateNonMandatoryTrainingCount}`
  );

  // put total expiring soon/expired training count
  putString(
    overviewSheet("c[r='D5']"),
    `${trainingCounts.expiredTrainingCount + trainingCounts.expiringTrainingCount + trainingCounts.upToDateTrainingCount}`
  );

  //insert total sum records in all three tables data
  let expiringMandatoryCounts = 0;
  let expiringNonMandatoryCounts = 0;
  let expiringTotalCounts = 0;
  for(let i = 0; i < expiringWorkerTrainings.length; i++){
    expiringMandatoryCounts = expiringMandatoryCounts + expiringWorkerTrainings[i].MandatoryCount;
    expiringNonMandatoryCounts = expiringNonMandatoryCounts + expiringWorkerTrainings[i].NonMandatoryCount;
    expiringTotalCounts = expiringTotalCounts + expiringWorkerTrainings[i].Count;
  }
  expiringWorkerTrainings.push({ ID: -1, NameOrIdValue: 'Total', MandatoryCount: expiringMandatoryCounts, NonMandatoryCount: expiringNonMandatoryCounts, Count: expiringTotalCounts});
  let expiredMandatoryCounts = 0;
  let expiredNonMandatoryCounts = 0;
  let expiredTotalCounts = 0;
  for(let i = 0; i < expiredWorkerTrainings.length; i++){
    expiredMandatoryCounts = expiredMandatoryCounts + expiredWorkerTrainings[i].MandatoryCount;
    expiredNonMandatoryCounts = expiredNonMandatoryCounts + expiredWorkerTrainings[i].NonMandatoryCount;
    expiredTotalCounts = expiredTotalCounts + expiredWorkerTrainings[i].Count;
  }
  expiredWorkerTrainings.push({ ID: -1, NameOrIdValue: 'Total', MandatoryCount: expiredMandatoryCounts, NonMandatoryCount: expiredNonMandatoryCounts, Count: expiredTotalCounts});

  let totalMissingMandatoryTrainingCount = 0;
  for(let i = 0; i < missingMandatoryTrainingRecords.length; i++){
    missingMandatoryTrainingRecords[i].count = 'Non applicable';
    totalMissingMandatoryTrainingCount = totalMissingMandatoryTrainingCount + missingMandatoryTrainingRecords[i].missingMandatoryTrainingCount;
  }
  missingMandatoryTrainingRecords.push({ ID: -1, NameOrIdValue: 'Total', missingMandatoryTrainingCount: totalMissingMandatoryTrainingCount, count: 0});
  //put all missing mandatory traing details
  let currentRowMandatory = overviewSheet("row[r='17']");
  let rowIndexMandatory = 17;
  let updateMandatoryRowIndex = rowIndexMandatory + (expiredWorkerTrainings.length - 1) + (expiringWorkerTrainings.length-1);
  for (; rowIndexMandatory >= 14; rowIndexMandatory--, updateMandatoryRowIndex--) {

    if (currentRowMandatory.children('c').length) {
      currentRowMandatory.children('c').each((index, element) => {
        overviewSheet(element).attr('r', String(overviewSheet(element).attr('r')).replace(/\d+$/, '') + updateMandatoryRowIndex);
      });
    }

    currentRowMandatory.attr('r', updateMandatoryRowIndex);

    if (currentRowMandatory.prev().length !== 0) {
      currentRowMandatory = currentRowMandatory.prev();
      if(currentRowMandatory.name === 'row') {
        break;
      }
    }
  }

  let bottomMandatoryRowIndex = 17 + (expiredWorkerTrainings.length - 1) + (expiringWorkerTrainings.length-1);
  const templateRowMissing = overviewSheet(`row[r='${bottomMandatoryRowIndex}']`);
  let currentRowMissing = templateRowMissing;
  let rowIndexMissing = bottomMandatoryRowIndex + 1;
  if (missingMandatoryTrainingRecords.length > 0) {
    for (let i = 0; i < missingMandatoryTrainingRecords.length - 1; i++) {
      const tempRowBottomMissing = templateRowMissing.clone(true);

      tempRowBottomMissing.attr('r', rowIndexMissing);

      tempRowBottomMissing.children('c').each((index, element) => {
        overviewSheet(element).attr('r', String(overviewSheet(element).attr('r')).replace(/\d+$/, '') + rowIndexMissing);
      });

      currentRowMissing.after(tempRowBottomMissing);

      currentRowMissing = tempRowBottomMissing;
      rowIndexMissing++;
    }

    currentRowMissing = templateRowMissing;
  }

  // fix the dimensions tag value
  const dimension = overviewSheet('dimension');
  dimension.attr('ref', String(dimension.attr('ref')).replace(/\d+$/, '') + rowIndexMissing);

  // update the cell values
  for (let row = 0; row < missingMandatoryTrainingRecords.length; row++) {
    debuglog('updating training sheet', row);
    const rowType = row === missingMandatoryTrainingRecords.length - 1 ? 'OVRLAST' : 'OVRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 4; column++) {
      const columnText = String.fromCharCode(column + 65);
      const cellToChange = currentRowMissing.children(`c[r='${columnText}${bottomMandatoryRowIndex + row}']`);
      switch (columnText) {
        case 'A':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              missingMandatoryTrainingRecords[row].NameOrIdValue,
              columnText,
              rowType
            );
          }
          break;
        case 'B':
          {
            basicValidationUpdate(putString, cellToChange, missingMandatoryTrainingRecords[row].missingMandatoryTrainingCount, columnText, rowType);
          }
          break;
        case 'C':
          {
            basicValidationUpdate(putString, cellToChange, missingMandatoryTrainingRecords[row].count, columnText, rowType);
          }
          break;
        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, missingMandatoryTrainingRecords[row].missingMandatoryTrainingCount, columnText, rowType);
          }
          break;
      }
    }

    currentRowMissing = currentRowMissing.next();
  }

  //put all expiring traing details
  let currentRowBottom = overviewSheet("row[r='13']");
  let rowIndexBottom = 13;
  let updateRowIndex = rowIndexBottom + expiredWorkerTrainings.length - 1;
  for (; rowIndexBottom >= 10; rowIndexBottom--, updateRowIndex--) {

    if (currentRowBottom.children('c').length) {
      currentRowBottom.children('c').each((index, element) => {
        overviewSheet(element).attr('r', String(overviewSheet(element).attr('r')).replace(/\d+$/, '') + updateRowIndex);
      });
    }

    currentRowBottom.attr('r', updateRowIndex);

    if (currentRowBottom.prev().length !== 0) {
      currentRowBottom = currentRowBottom.prev();
      if(currentRowBottom.name === 'row') {
        break;
      }
    }
  }

  let bottomRowIndex = 13 + expiredWorkerTrainings.length - 1;
  const templateRowExpiring = overviewSheet(`row[r='${bottomRowIndex}']`);
  let currentRowExpiring = templateRowExpiring;
  let rowIndexExpiring = bottomRowIndex + 1;
  if (expiringWorkerTrainings.length > 0) {
    for (let i = 0; i < expiringWorkerTrainings.length - 1; i++) {
      const tempRowBottom = templateRowExpiring.clone(true);
      tempRowBottom.attr('r', rowIndexExpiring);

      tempRowBottom.children('c').each((index, element) => {
        overviewSheet(element).attr('r', String(overviewSheet(element).attr('r')).replace(/\d+$/, '') + rowIndexExpiring);
      });

      currentRowExpiring.after(tempRowBottom);
      currentRowExpiring = tempRowBottom;
      rowIndexExpiring++;
    }

    currentRowExpiring = templateRowExpiring;
  }

  // update the cell values
  for (let row = 0; row < expiringWorkerTrainings.length; row++) {
    debuglog('updating training sheet', row);
    const rowType = row === expiringWorkerTrainings.length - 1 ? 'OVRLAST' : 'OVRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 4; column++) {
      const columnText = String.fromCharCode(column + 65);
      const cellToChange = currentRowExpiring.children(`c[r='${columnText}${row + bottomRowIndex}']`);
      switch (columnText) {
        case 'A':
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
        case 'B':
          {
            basicValidationUpdate(putString, cellToChange, expiringWorkerTrainings[row].MandatoryCount, columnText, rowType);
          }
          break;
        case 'C':
          {
            basicValidationUpdate(putString, cellToChange, expiringWorkerTrainings[row].NonMandatoryCount, columnText, rowType);
          }
          break;
        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, expiringWorkerTrainings[row].Count, columnText, rowType);
          }
          break;
      }
    }

    currentRowExpiring = currentRowExpiring.next();
  }

  //put all expired training details
  // clone the row the apropriate number of times
  const templateRow = overviewSheet("row[r='9']");
  let currentRow = templateRow;
  let rowIndex = 10;
  if (expiredWorkerTrainings.length > 0) {
    for (let i = 0; i < expiredWorkerTrainings.length - 1; i++) {
      const tempRow = templateRow.clone(true);
      tempRow.attr('r', rowIndex);

      tempRow.children('c').each((index, element) => {
        overviewSheet(element).attr('r', String(overviewSheet(element).attr('r')).replace(/\d+$/, '') + rowIndex);
      });

      currentRow.after(tempRow);
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
      const cellToChange = currentRow.children(`c[r='${columnText}${row + 9}']`);
      switch (columnText) {
        case 'A':
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
        case 'B':
          {
            basicValidationUpdate(putString, cellToChange, expiredWorkerTrainings[row].MandatoryCount, columnText, rowType);
          }
          break;
        case 'C':
          {
            basicValidationUpdate(putString, cellToChange, expiredWorkerTrainings[row].NonMandatoryCount, columnText, rowType);
          }
          break;
        case 'D':
          {
            basicValidationUpdate(putString, cellToChange, expiredWorkerTrainings[row].Count, columnText, rowType);
          }
          break;
      }
    }
    currentRow = currentRow.next();
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
  const templateRow = trainingsSheet("row[r='2']");
  let currentRow = templateRow;
  let rowIndex = 3;
  let trainingArray = reportData.trainings;
  if (trainingArray.length > 1) {
    for (let i = 0; i < trainingArray.length - 1; i++) {
      const tempRow = templateRow.clone(true);

      tempRow.attr('r', rowIndex);

      tempRow.children('c').each((index, element) => {
        trainingsSheet(element).attr('r', String(trainingsSheet(element).attr('r')).replace(/\d+$/, '') + rowIndex);
      });

      currentRow.after(tempRow);

      currentRow = tempRow;
      rowIndex++;
    }

    currentRow = templateRow;
  }

  // fix the last row in the table
  trainingsSheet('sheetData row:last-child').attr('r', rowIndex);

  // fix the dimensions tag value
  const dimension = trainingsSheet('dimension');
  dimension.attr('ref', String(dimension.attr('ref')).replace(/\d+$/, '') + rowIndex);

  // update the cell values
  for (let row = 0; row < trainingArray.length; row++) {
    debuglog('updating training sheet', row);

    const rowType = row === trainingArray.length - 1 ? 'TRNLAST' : 'TRNREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 9; column++) {
      const columnText = String.fromCharCode(column + 65);
      const isRed = false;

      const cellToChange = currentRow.children(`c[r='${columnText}${row + 2}']`);
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
            putString(trainingsSheet(`c[r='${columnText}${row + 2}']`), trainingArray[row].Status);
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
            trainingsSheet(`c[r='${columnText}${row + 2}']`).attr('s', styleCol);
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
            break
      }
    }
    currentRow = currentRow.next();
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
        const sst = sharedStrings('sst');

        const sharedStringsUniqueCount = [parseInt(sst.attr('uniqueCount'), 10)];
        const sharedStringsCount = [parseInt(sst.attr('count'), 10)];

        // update the overview sheet with the report data and add it to the zip
        outputZip.file(overviewSheetName, updateOverviewSheet(
          overviewSheet,
          sharedStrings,
          sst,
          sharedStringsUniqueCount, // pass unique count by reference rather than by value
          sharedStringsCount
        ).xml());

        //outputZip.file(establishmentsSheetName, serializeXML(establishmentsSheet));
        //outputZip.file(trainingsSheetName, serializeXML(updateTrainingsSheet));

        // update the trainings sheet with the report data and add it to the zip
        outputZip.file(trainingsSheetName, updateTrainingsSheet(
          trainingsSheet,
          reportData,
          sharedStrings,
          sst,
          sharedStringsUniqueCount, // pass unique count by reference rather than by value
          sharedStringsCount
        ).xml());

        // update the shared strings counts we've been keeping track of
        sst.attr('uniqueCount', sharedStringsUniqueCount[0]);
        sst.attr('count', sharedStringsCount[0]);

        // add the updated shared strings to the zip
        outputZip.file(sharedStringsName, sharedStrings.xml());
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
    const thisEstablishment = await models.establishment.findOne({
      where: {
          id: req.establishmentId
      },
      attributes: ['id']
    });

    if(thisEstablishment){
      const date = new Date();
      const report = await getReport(date, thisEstablishment.id);

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
    }else{
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

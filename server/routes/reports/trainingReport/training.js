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

const { Establishment } = require('../../../models/classes/establishment');
const { getTrainingData } = rfr('server/data/trainingReport');

// Constants string needed by this file in several places
const folderName = 'template';
const overviewSheetName = path.join('xl', 'worksheets', 'sheet1.xml');
const trainingsSheetName = path.join('xl', 'worksheets', 'sheet2.xml');
const sharedStringsName = path.join('xl', 'sharedStrings.xml');
const schema = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const isNumberRegex = /^[0-9]+(\.[0-9]+)?$/;
//const debuglog = console.log.bind(console);
const debuglog = () => {};

// XML DOM manipulation helper functions
const { DOMParser, XMLSerializer } = new (require('jsdom').JSDOM)().window;

const parseXML = fileContent =>
  (new DOMParser()).parseFromString(fileContent.toString('utf8'), 'application/xml');

const serializeXML = dom =>
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  (new XMLSerializer()).serializeToString(dom);

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
const putStringTemplate = (
  sheetDoc,
  stringsDoc,
  sst,
  sharedStringsUniqueCount,
  element,
  value
) => {
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
    vTag.textContent = textValue;

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
    trainings: await getTrainingReportData(thisEstablishment.id)
  };
};
/**
 * Function used to customize training report data
 *
 * @param {number} establishmentId
 * @return {Object} All customized training report data
 */
const getTrainingReportData = async establishmentId => {
  const trainingData = await getTrainingData(establishmentId);

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
      C: 7,
      D: 15,
      E: 9,
      F: 11,
      G: 11,
      H: 12,
      I: 12,
      J: 12,
      K: 12
    },
    OVRLAST: {
      A: 2,
      B: 16,
      C: 17,
      D: 15,
      E: 19,
      F: 21,
      G: 21,
      H: 22,
      I: 22,
      J: 22,
      K: 22
    },
    TRNREGULAR: {
      A: 16,
      B: 16,
      C: 16,
      D: 16,
      E: 16,
      F: 14,
      G: 16,
      H: 16,
      I: 16
    },
    TRNLAST: {
      A: 17,
      B: 17,
      C: 17,
      D: 17,
      E: 17,
      F: 15,
      G: 17,
      H: 17,
      I: 17
    }
  },
  RED: {
    OVRREGULAR: {
      A: 2,
      B: 6,
      C: 7,
      D: 67,
      E: 9,
      F: 65,
      G: 65,
      H: 11,
      I: 12,
      J: 12,
      K: 66
    },
    OVRLAST: {
      A: 2,
      B: 16,
      C: 17,
      D: 67,
      E: 19,
      F: 65,
      G: 65,
      H: 22,
      I: 22,
      J: 22,
      K: 66
    },
    TRNREGULAR: {
      A: 2,
      B: 6,
      C: 6,
      D: 7,
      E: 24,
      F: 15,
      G: 67,
      H: 67,
      I: 15
    },
    TRNLAST: {
      A: 2,
      B: 16,
      C: 16,
      D: 17,
      E: 31,
      F: 20,
      G: 67,
      H: 67,
      I: 20
    }
  }
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
const basicValidationUpdate = (putString, cellToChange, value, columnText, rowType, percentColumn = false) => {
  let isRed = false;
  const stringValue = String(value);

  if (stringValue === 'No' || stringValue === 'Not Eligible' || stringValue === 'Missing') {
    isRed = true;
  }

  if (percentColumn && value) {
    let percentValue = value.split('%');
    if (Number(percentValue[0]) !== 100) {
      isRed = true;
    }
  }

  putString(
    cellToChange,
    value
  );

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
  sharedStringsUniqueCount
) => {
  debuglog('updating overview sheet');

  const putString = putStringTemplate.bind(null, overviewSheet, sharedStrings, sst, sharedStringsUniqueCount);

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
  sharedStringsUniqueCount
) => {
  debuglog('updating trainings sheet');

  const putString = putStringTemplate.bind(null, trainingsSheet, sharedStrings, sst, sharedStringsUniqueCount);

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

    for (let column = 0; column < 10; column++) {
      const columnText = String.fromCharCode(column + 65);
      const isRed = false;

      const cellToChange = (typeof nextSibling.querySelector === 'function') ? nextSibling : currentRow.querySelector(`c[r='${columnText}${row + 7}']`);
      switch (columnText) {
        case 'A': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].NameOrIdValue}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].NameOrIdValue,
            columnText,
            rowType
          );
        } break;

        case 'B': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].JobName}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].JobName,
            columnText,
            rowType
          );
        } break;

        case 'C': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Category}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].Category,
            columnText,
            rowType
          );
        } break;

        case 'D': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Title}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].Title,
            columnText,
            rowType
          );
        } break;

        case 'E': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Title}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].Title,
            columnText,
            rowType
          );
        } break;

        case 'F': {
          console.log(`value of ${columnText}${row + 7}: Yes`);
          basicValidationUpdate(
            putString,
            cellToChange,
            'Yes',
            columnText,
            rowType
          );
        } break;

        case 'G': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Expires}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].Expires,
            columnText,
            rowType
          );
        } break;

        case 'H': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Completed}`);
          putString(
            cellToChange,
            trainingArray[row].Completed
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'I': {
          console.log(`value of ${columnText}${row + 7}: ${trainingArray[row].Accredited}`);
          basicValidationUpdate(
            putString,
            cellToChange,
            trainingArray[row].Accredited,
            columnText,
            rowType
          );
        } break;
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

  return (new Promise(resolve => {
    const thePath = path.join(__dirname, folderName);
    const walker = walk.walk(thePath);
    const outputZip = new JsZip();

    let overviewSheet, trainingsSheet, sharedStrings;

    debuglog('iterating filesystem', thePath);

    walker.on('file', (root, fileStats, next) => {
      const pathName = root.replace(thePath, '').replace('\\', '/').replace(/^\//, '');
      const zipPath = (pathName === '' ? fileStats.name : path.join(pathName, fileStats.name));
      const readPath = path.join(thePath, zipPath);
      debuglog('file found', readPath);

      fs.readFile(`${readPath}`, (err, fileContent) => {
        debuglog('content read', zipPath);

        if (!err) {
          switch (zipPath) {
            case overviewSheetName: {
              overviewSheet = parseXML(fileContent);
            } break;

            case trainingsSheetName: {
              trainingsSheet = parseXML(fileContent);
            } break;

            case sharedStringsName: {
              sharedStrings = parseXML(fileContent);
            } break;

            default: {
              outputZip.file(zipPath, fileContent);
            } break;
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

        // update the overview sheet with the report data and add it to the zip
        outputZip.file(overviewSheetName, serializeXML(updateOverviewSheet(
          overviewSheet,
          reportData,
          sharedStrings,
          sst,
          sharedStringsUniqueCount // pass unique count by reference rather than by value
        )));

        //outputZip.file(establishmentsSheetName, serializeXML(establishmentsSheet));
        //outputZip.file(trainingsSheetName, serializeXML(updateTrainingsSheet));

        // update the trainings sheet with the report data and add it to the zip
        outputZip.file(trainingsSheetName, serializeXML(updateTrainingsSheet(
          trainingsSheet,
          reportData,
          sharedStrings,
          sst,
          sharedStringsUniqueCount // pass unique count by reference rather than by value
        )));

        // update the shared strings counts we've been keeping track of
        sst.setAttribute('uniqueCount', sharedStringsUniqueCount[0]);

        // add the updated shared strings to the zip
        outputZip.file(sharedStringsName, serializeXML(sharedStrings));
      }

      debuglog('training report: creating zip file');

      resolve(outputZip);
    });
  }))

    .then(outputZip => outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    }));
};

/**
 * Handle GET API request to get Training report data
 */
router.route('/').get(async (req, res) => {
  try {
    // first ensure this report can only be run by those establishments that are a parent
    const thisEstablishment = new Establishment(req.username);

    if (await thisEstablishment.restore(req.establishment.id, false)) {
      if (thisEstablishment.isParent) {
        const date = new Date();
        const report = await getReport(date, thisEstablishment);

        if (report) {
          res.setHeader('Content-disposition',
              `attachment; filename=${moment(date).format('YYYY-MM-DD')}-SFC-Training-Report.xlsx`);
          res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Length', report.length);

          console.log('report/training - 200 response');

          return res.status(200).end(report);
        } else {
          // failed to run the report
          console.error('report/training - failed to run the report');

          return res.status(503).send('ERR: Failed to run report');
        }
      } else {
        // only allow on those establishments being a parent

        console.log('report/training 403 response');

        return res.status(403).send();
      }
    } else {
      console.error('report/training - failed restoring establisment');
      return res.status(503).send('ERR: Failed to restore establishment');
    }
  } catch (err) {
    console.error('report/training - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
});

module.exports = router;

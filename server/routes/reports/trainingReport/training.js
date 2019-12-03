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
const { getTrainingReportData } = rfr('server/data/trainingReport');

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

// helper function to set a spreadsheet cell's value
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
    vTag.textContent = sharedStringsUniqueCount[0];

    sharedStringsUniqueCount[0] += 1;
  }
};

const getReportData = async (date, thisEstablishment) => {
  debuglog('training excel report data started:', thisEstablishment);

  return {
    date: date.toISOString(),
    trainings: await getTrainingReportData(thisEstablishment.id)
  };
};

const propsNeededToComplete = ('MainService,EmployerTypeValue,Capacities,ServiceUsers,' +
'NumberOfStaffValue').split(',');

const getTrainingReportData = async establishmentId => {
  const trainingData = await getTrainingData(establishmentId);

  return trainingData;
};

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
    ESTREGULAR: {
      A: 2,
      B: 6,
      C: 6,
      D: 7,
      E: 24,
      F: 15,
      G: 15,
      H: 15,
      I: 15,
      J: 9,
      K: 26,
      L: 27,
      M: 12,
      N: 12,
      O: 15,
      P: 15,
      Q: 15
    },
    ESTLAST: {
      A: 2,
      B: 16,
      C: 16,
      D: 17,
      E: 31,
      F: 20,
      G: 20,
      H: 20,
      I: 20,
      J: 9,
      K: 32,
      L: 33,
      M: 22,
      N: 12,
      O: 20,
      P: 20,
      Q: 20
    },
    WKRREGULAR: {
      A: 2,
      B: 38,
      C: 15,
      D: 15,
      E: 15,
      F: 15,
      G: 15,
      H: 15,
      I: 9,
      J: 15,
      K: 15,
      L: 9,
      M: 9,
      N: 15,
      O: 15,
      P: 15,
      Q: 15,
      R: 15,
      S: 15
    },
    WKRLAST: {
      A: 2,
      B: 41,
      C: 20,
      D: 20,
      E: 20,
      F: 20,
      G: 20,
      H: 20,
      I: 9,
      J: 20,
      K: 20,
      L: 9,
      M: 9,
      N: 20,
      O: 20,
      P: 20,
      Q: 20,
      R: 20,
      S: 20
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
    ESTREGULAR: {
      A: 2,
      B: 6,
      C: 6,
      D: 7,
      E: 24,
      F: 15,
      G: 67,
      H: 67,
      I: 15,
      J: 65,
      K: 26,
      L: 27,
      M: 12,
      N: 66,
      O: 67,
      P: 67,
      Q: 67
    },
    ESTLAST: {
      A: 2,
      B: 16,
      C: 16,
      D: 17,
      E: 31,
      F: 20,
      G: 67,
      H: 67,
      I: 20,
      J: 65,
      K: 32,
      L: 33,
      M: 22,
      N: 66,
      O: 67,
      P: 67,
      Q: 67
    },
    WKRREGULAR: {
      A: 2,
      B: 38,
      C: 15,
      D: 67,
      E: 67,
      F: 67,
      G: 15,
      H: 67,
      I: 65,
      J: 15,
      K: 67,
      L: 65,
      M: 65,
      N: 67,
      O: 67,
      P: 67,
      Q: 67,
      R: 67,
      S: 67
    },
    WKRLAST: {
      A: 2,
      B: 41,
      C: 20,
      D: 67,
      E: 67,
      F: 67,
      G: 20,
      H: 67,
      I: 65,
      J: 20,
      K: 67,
      L: 65,
      M: 65,
      N: 67,
      O: 67,
      P: 67,
      Q: 67,
      R: 67,
      S: 67
    }
  }
};

const setStyle = (cellToChange, columnText, rowType, isRed) => {
  cellToChange.setAttribute('s', styleLookup[isRed ? 'RED' : 'BLACK'][rowType][columnText]);
};

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

const updateOverviewSheet = (
  overviewSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount
) => {
  debuglog('updating overview sheet');

  const putString = putStringTemplate.bind(null, overviewSheet, sharedStrings, sst, sharedStringsUniqueCount);

  // set headers
  putString(
    overviewSheet.querySelector("c[r='B6']"),
    `Parent name : ${reportData.parentName}`
  );

  putString(
    overviewSheet.querySelector("c[r='B7']"),
    `Date: ${moment(reportData.date).format('DD/MM/YYYY')}`
  );

  const templateRow = overviewSheet.querySelector("row[r='11']");

  // move the footer rows down appropriately
  //no rows = -1
  //one row = 0
  //two rows = 1
  let currentRow = overviewSheet.querySelector("row[r='16']");
  let rowIndex = 16;
  let updateRowIndex = 16 + reportData.establishments.length - 1;

  for(; rowIndex > 11; rowIndex--, updateRowIndex--) {
    if(rowIndex === 16) {
      // fix the dimensions tag value
      const dimension = overviewSheet.querySelector('dimension');
      dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + updateRowIndex);
    }

    currentRow.querySelectorAll('c').forEach(elem => {
      elem.setAttribute('r', String(elem.getAttribute('r')).replace(/\d+$/, '') + updateRowIndex);
    });

    currentRow.setAttribute('r', updateRowIndex);

    const mergeCell = overviewSheet.querySelector(`mergeCell[ref='B${rowIndex}:L${rowIndex}']`);

    if(mergeCell !== null) {
      mergeCell.setAttribute('ref', `B${updateRowIndex}:L${updateRowIndex}`);
    }

    while(currentRow.previousSibling !== null) {
      currentRow = currentRow.previousSibling;

      if(currentRow.nodeName === 'row') {
        break;
      }
    }
  }

  // TODO: fix the page footer timestamp

  // clone the row the apropriate number of times
  currentRow = templateRow;
  rowIndex = 12;

  if (reportData.establishments.length > 1) {
    for (let i = 0; i < (reportData.establishments.length - 1); i++) {
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
  for (let row = 0; row < reportData.establishments.length; row++) {
    debuglog('updating overview', row);

    const rowType = row === reportData.establishments.length - 1 ? 'OVRLAST' : 'OVRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 10; column++) {
      const columnText = String.fromCharCode(column + 66);
      const isRed = false;

      const cellToChange = (typeof nextSibling.querySelector === 'function') ? nextSibling : currentRow.querySelector(`c[r='${columnText}${row + 11}']`);
      switch (columnText) {
        case 'B': {
          putString(
            cellToChange,
            reportData.establishments[row].SubsidiaryName
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'C': {
          putString(
            cellToChange,
            reportData.establishments[row].SubsidiarySharingPermissions
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'D': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.establishments[row].CurrentWdfEligibilityStatus,
            columnText,
            rowType
          );
        } break;

        case 'E': {
          putString(
            cellToChange,
            reportData.establishments[row].DateEligibilityAchieved
          );
        } break;

        case 'F': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.establishments[row].EstablishmentDataFullyCompleted,
            columnText,
            rowType
          );
        } break;

        case 'G': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.establishments[row].UpdatedInCurrentFinancialYear,
            columnText,
            rowType
          );
        } break;

        case 'H': {
          putString(
            cellToChange,
            reportData.establishments[row].NumberOfStaffValue
          );
        } break;

        case 'I': {
          putString(
            cellToChange,
            reportData.establishments[row].TotalIndividualWorkerRecord
          );
        } break;

        case 'J': {
          putString(
            cellToChange,
            reportData.establishments[row].CompletedWorkerRecords
          );
        } break;

        case 'K': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.establishments[row].CompletedWorkerRecordsPercentage,
            columnText,
            rowType,
            true
          );
        } break;
      }

      // TODO: duplicate the hyperlinked fields
      // //////////////////////////////////////

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog('overview updated');

  return overviewSheet;
};

const updateTrainingsSheet = (
  establishmentsSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount
) => {
  debuglog('updating establishments sheet');

  const putString = putStringTemplate.bind(null, establishmentsSheet, sharedStrings, sst, sharedStringsUniqueCount);

  // set headers
  putString(
    establishmentsSheet.querySelector("c[r='B6']"),
    `Parent name : ${reportData.parentName}`
  );

  putString(
    establishmentsSheet.querySelector("c[r='B7']"),
    `Date: ${moment(reportData.date).format('DD/MM/YYYY')}`
  );

  // clone the row the apropriate number of times
  const templateRow = establishmentsSheet.querySelector("row[r='11']");
  let currentRow = templateRow;
  let rowIndex = 12;
  let establishmentReportData = [...reportData.establishments];
  let establishmentArray = establishmentReportData.
      filter(est => {
        return (est.DataOwner === 'Parent' || est.DataPermissions !== "None")
      });
  if (establishmentArray.length > 1) {
    for (let i = 0; i < establishmentArray.length - 1; i++) {
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
  establishmentsSheet.querySelector('sheetData row:last-child').setAttribute('r', rowIndex);

  // fix the dimensions tag value
  const dimension = establishmentsSheet.querySelector('dimension');
  dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + rowIndex);

  // update the cell values
  for (let row = 0; row < establishmentArray.length; row++) {
    debuglog('updating establishment', row);

    const rowType = row === establishmentArray.length - 1 ? 'ESTLAST' : 'ESTREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 17; column++) {
      const columnText = String.fromCharCode(column + 65);
      const isRed = false;

      const cellToChange = (typeof nextSibling.querySelector === 'function') ? nextSibling : currentRow.querySelector(`c[r='${columnText}${row + 11}']`);

      switch (columnText) {
        case 'B': {
          putString(
            cellToChange,
            establishmentArray[row].SubsidiaryName
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'C': {
          putString(
            cellToChange,
            establishmentArray[row].SubsidiarySharingPermissions
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'D': {
          putString(
            cellToChange,
            establishmentArray[row].NmdsID
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'E': {
          putString(
            cellToChange,
            establishmentArray[row].EmployerTypeValue
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'F': {
          putString(
            cellToChange,
            establishmentArray[row].MainService
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'G': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].Capacities,
            columnText,
            rowType
          );
        } break;

        case 'H': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].Utilisations,
            columnText,
            rowType
          );
        } break;

        case 'I': {
          putString(
            cellToChange,
            establishmentArray[row].OtherServices
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'J': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].ServiceUsers,
            columnText,
            rowType
          );
        } break;

        case 'K': {
          putString(
            cellToChange,
            establishmentArray[row].LastUpdatedDate
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'L': {
          putString(
            cellToChange,
            establishmentArray[row].NumberOfStaffValue
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'M': {
          putString(
            cellToChange,
            establishmentArray[row].TotalIndividualWorkerRecord
          );
          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'N': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].PercentageOfWorkerRecords,
            columnText,
            rowType,
            true
          );
        } break;

        case 'O': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].Starters,
            columnText,
            rowType
          );
        } break;

        case 'P': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].Leavers,
            columnText,
            rowType
          );
        } break;

        case 'Q': {
          basicValidationUpdate(
            putString,
            cellToChange,
            establishmentArray[row].Vacancies,
            columnText,
            rowType
          );
        } break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog('establishments updated');

  return establishmentsSheet;
};

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
              establishmentsSheet = parseXML(fileContent);
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
        //outputZip.file(workersSheetName, serializeXML(workersSheet));

        // update the establishments sheet with the report data and add it to the zip
        outputZip.file(updateTrainingsSheet, serializeXML(updateEstablishmentsSheet(
          establishmentsSheet,
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

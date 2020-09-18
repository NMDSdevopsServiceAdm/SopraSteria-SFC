// Local Authority user's report
'use strict';

//external node modules
const moment = require('moment');
const fs = require('fs');
const walk = require('walk');
const JsZip = new require('jszip');
const path = require('path');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();

//Constants string needed by this file in several places
const folderName = 'template';
const workplacesSheetName = path.join('xl', 'worksheets', 'sheet1.xml');
const staffRecordsSheetName = path.join('xl', 'worksheets', 'sheet2.xml');
const sharedStringsName = path.join('xl', 'sharedStrings.xml');
const isNumberRegex = /^[0-9]+(\.[0-9]+)?$/;

//const debuglog = console.log.bind(console);
const debuglog = () => {};

const reportLock = require('../../../utils/fileLock');
//XML DOM manipulation helper functions
const parseXML = (fileContent) =>
  cheerio.load(fileContent, {
    xml: {
      normalizeWhitespace: true,
    },
  });

//helper function to set a spreadsheet cell's value
const putStringTemplate = (sheetDoc, stringsDoc, sst, sharedStringsUniqueCount, element, value) => {
  let vTag = element.children('v').first();
  const hasVTag = element.children('v').length;

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

    sharedStringsUniqueCount[0] += 1;
  }
};

// for database
const models = require('../../../models');

// for report dates/formatting
const config = require('../../../config/config');
const fromDate = config.get('app.reports.localAuthority.fromDate');
const toDate = config.get('app.reports.localAuthority.toDate');

// for establishment entity
const Establishment = require('../../../models/classes/establishment').Establishment;

// identifies the associated local authority of the establishment - code taken from establishment::restore
const identifyLocalAuthority = async (postcode) => {
  // need to identify which, if any, of the shared authorities is attributed to the
  // primary Authority; that is the Local Authority associated with the physical area
  // of the given Establishment (using the postcode as the key)
  let primaryAuthorityCssr;

  // lookup primary authority by trying to resolve on specific postcode code
  const cssrResults = await models.pcodedata.findOne({
    where: {
      postcode,
    },
    include: [
      {
        model: models.cssr,
        as: 'theAuthority',
        attributes: ['id', 'name', 'nmdsIdLetter'],
      },
    ],
  });

  if (
    cssrResults &&
    cssrResults.postcode === postcode &&
    cssrResults.theAuthority &&
    cssrResults.theAuthority.id &&
    Number.isInteger(cssrResults.theAuthority.id)
  ) {
    return cssrResults.theAuthority.name;
  }

  //  using just the first half of the postcode
  const [firstHalfOfPostcode] = postcode.split(' ');

  // must escape the string to prevent SQL injection
  const fuzzyCssrIdMatch = await models.sequelize.query(
    `select "Cssr"."CssrID", "Cssr"."CssR" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(
      firstHalfOfPostcode,
    )}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR"`,
    {
      type: models.sequelize.QueryTypes.SELECT,
    },
  );

  if (fuzzyCssrIdMatch && fuzzyCssrIdMatch.length === 1 && fuzzyCssrIdMatch[0].CssrID) {
    return fuzzyCssrIdMatch[0].CssR;
  }

  //Couldn't get local authority name. Just leave it blank?
  return '';
};

const LAReport = {
  run: async (date, thisEstablishment) => {
    // for the report
    const establishmentId = thisEstablishment.id;

    // first run the report, which means running the `cqc.localAuthorityReport` function.
    // this function runs in a single transaction
    // the function returns true or false; encapsulating any SQL exceptions.
    const params = {
      replacements: {
        givenEstablishmentId: establishmentId,
        givenFromDate: fromDate,
        givenToDate: toDate,
      },
      type: models.sequelize.QueryTypes.SELECT,
    };

    debuglog('LA user report data started:', params);

    const runReport = await models.sequelize.query(
      `select cqc.localAuthorityReport(:givenEstablishmentId, :givenFromDate, :givenToDate);`,
      params,
    );

    // if report fails return no data
    if (!runReport || String(runReport[0].localauthorityreport) !== 'true') {
      return null;
    }

    //Construct the model data object for the report
    const reportData = {
      date: date.toISOString(),
      reportEstablishment: {
        name: thisEstablishment.name,
        nmdsId: thisEstablishment.nmdsId,
        localAuthority: await identifyLocalAuthority(thisEstablishment.postcode),
      },
      establishments: [],
      workers: [],
    };

    // now grab the establishments and format the report data
    const reportEstablishments = await models.localAuthorityReportEstablishment.findAll({
      where: {
        establishmentFk: establishmentId,
      },
      order: [['workplaceName', 'ASC']],
    });

    if (reportEstablishments && Array.isArray(reportEstablishments)) {
      reportEstablishments.forEach(async (est) => {
        const establishmentDetails = await models.establishment.findOne({
          where: {
            id: est.workplaceFk,
          },
          attributes: ['id', 'ustatus'],
        });
        if (establishmentDetails && establishmentDetails.ustatus !== 'PENDING') {
          reportData.establishments.push(est);
        }
      });
    }

    // now grab the workers and format the report data
    const reportWorkers = await models.localAuthorityReportWorker.findAll({
      where: {
        establishmentFk: establishmentId,
      },
      order: [
        ['workplaceName', 'ASC'],
        ['localId', 'ASC'],
      ],
    });

    if (reportWorkers && Array.isArray(reportWorkers)) {
      reportData.workers = reportWorkers;
    }

    debuglog('LA user report data finished:', params, reportData.establishments.length, reportData.workers.length);

    return reportData;
  },
};

const styleLookup = {
  BLACK: {
    ESTFIRST: {
      A: 15,
      B: 16,
      C: 17,
      D: 16,
      E: 16,
      F: 16,
      G: 16,
      H: 18,
      I: 18,
      J: 16,
      K: 16,
      L: 16,
      M: 16,
      N: 16,
      O: 16,
      P: 17,
      Q: 16,
      R: 19,
      S: 18,
      T: 16,
      U: 20,
      V: 21,
      W: 22,
      X: 23,
    },
    ESTLAST: {
      A: 30,
      B: 31,
      C: 32,
      D: 33,
      E: 31,
      F: 31,
      G: 31,
      H: 37,
      I: 37,
      J: 31,
      K: 31,
      L: 31,
      M: 31,
      N: 31,
      O: 31,
      P: 32,
      Q: 31,
      R: 36,
      S: 37,
      T: 31,
      U: 38,
      V: 39,
      W: 40,
      X: 38,
    },
    ESTREGULAR: {
      A: 24,
      B: 8,
      C: 9,
      D: 8,
      E: 8,
      F: 8,
      G: 8,
      H: 10,
      I: 10,
      J: 8,
      K: 8,
      L: 8,
      M: 8,
      N: 8,
      O: 8,
      P: 9,
      Q: 8,
      R: 11,
      S: 10,
      T: 8,
      U: 11,
      V: 13,
      W: 14,
      X: 67,
    },
    ESTTOTAL: {
      A: 7,
      B: 8,
      C: 9,
      D: 8,
      E: 8,
      F: 8,
      G: 8,
      H: 10,
      I: 10,
      J: 8,
      K: 8,
      L: 8,
      M: 8,
      N: 8,
      O: 8,
      P: 9,
      Q: 8,
      R: 11,
      S: 10,
      T: 8,
      U: 67,
      V: 13,
      W: 14,
      X: 67,
    },
    WORKERREGULAR: {
      A: 24,
      B: 8,
      C: 8,
      D: 8,
      E: 8,
      F: 8,
      G: 8,
      H: 8,
      I: 8,
      J: 10,
      K: 10,
      L: 8,
      M: 42,
      N: 8,
      O: 8,
      P: 8,
      Q: 8,
      R: 57,
    },
    WORKERLAST: {
      A: 30,
      B: 31,
      C: 31,
      D: 31,
      E: 31,
      F: 31,
      G: 31,
      H: 31,
      I: 31,
      J: 37,
      K: 37,
      L: 31,
      M: 44,
      N: 31,
      O: 31,
      P: 31,
      Q: 31,
      R: 56,
    },
  },
  RED: {
    ESTFIRST: {
      A: 58,
      B: 59,
      C: 60,
      D: 59,
      E: 59,
      F: 59,
      G: 59,
      H: 61,
      I: 61,
      J: 59,
      K: 59,
      L: 59,
      M: 59,
      N: 59,
      O: 59,
      P: 60,
      Q: 59,
      R: 62,
      S: 61,
      T: 59,
      U: 63,
      V: 64,
      W: 65,
      X: 66,
    },
    ESTLAST: {
      A: 30,
      B: 34,
      C: 70,
      D: 33,
      E: 34,
      F: 34,
      G: 34,
      H: 35,
      I: 35,
      J: 34,
      K: 34,
      L: 34,
      M: 34,
      N: 34,
      O: 34,
      P: 70,
      Q: 34,
      R: 68,
      S: 35,
      T: 34,
      U: 41,
      V: 34,
      W: 35,
      X: 41,
    },
    ESTREGULAR: {
      A: 26,
      B: 26,
      C: 25,
      D: 26,
      E: 26,
      F: 26,
      G: 26,
      H: 27,
      I: 27,
      J: 26,
      K: 26,
      L: 26,
      M: 26,
      N: 26,
      O: 26,
      P: 25,
      Q: 26,
      R: 29,
      S: 27,
      T: 26,
      U: 12,
      V: 26,
      W: 27,
      X: 12,
    },
    ESTTOTAL: {
      A: 7,
      B: 8,
      C: 9,
      D: 8,
      E: 8,
      F: 8,
      G: 8,
      H: 10,
      I: 10,
      J: 26,
      K: 26,
      L: 26,
      M: 26,
      N: 26,
      O: 26,
      P: 25,
      Q: 26,
      R: 29,
      S: 27,
      T: 26,
      U: 12,
      V: 26,
      W: 27,
      X: 12,
    },
    WORKERREGULAR: {
      A: 24,
      B: 26,
      C: 26,
      D: 26,
      E: 26,
      F: 26,
      G: 26,
      H: 26,
      I: 26,
      J: 27,
      K: 27,
      L: 26,
      M: 27,
      N: 26,
      O: 26,
      P: 26,
      Q: 26,
      R: 25,
    },
    WORKERLAST: {
      A: 30,
      B: 34,
      C: 34,
      D: 34,
      E: 34,
      F: 34,
      G: 34,
      H: 34,
      I: 34,
      J: 55,
      K: 55,
      L: 34,
      M: 55,
      N: 34,
      O: 34,
      P: 34,
      Q: 34,
      R: 70,
    },
  },
};

const setStyle = (cellToChange, columnText, rowType, isRed) => {
  cellToChange.attr('s', styleLookup[isRed ? 'RED' : 'BLACK'][rowType][columnText]);
};

const basicValidationUpdate = (putString, cellToChange, value, columnText, rowType) => {
  let isRed = false;

  if (!isNumberRegex.test(String(value))) {
    value = 'Missing';
    isRed = true;
  }

  putString(cellToChange, value);

  setStyle(cellToChange, columnText, rowType, isRed);
};

const updateWorkplacesSheet = (workplacesSheet, reportData, sharedStrings, sst, sharedStringsUniqueCount) => {
  debuglog('updating workplaces sheet');

  const putString = putStringTemplate.bind(null, workplacesSheet, sharedStrings, sst, sharedStringsUniqueCount);

  //set headers
  putString(workplacesSheet("c[r='B5']"), moment(reportData.date).format('DD/MM/YYYY'));

  putString(workplacesSheet("c[r='B6']"), reportData.reportEstablishment.localAuthority);

  putString(workplacesSheet("c[r='B7']"), reportData.reportEstablishment.name);

  // clone the row the apropriate number of times
  const templateRow = workplacesSheet("row[r='13']");
  let currentRow = templateRow;
  let rowIndex = 14;

  if (reportData.establishments.length > 1) {
    for (let i = 0; i < reportData.establishments.length - 1; i++) {
      const tempRow = templateRow.clone(true);

      tempRow.attr('r', rowIndex);
      tempRow.children('c').each((index, elem) => {
        workplacesSheet(elem).attr('r', String(workplacesSheet(elem).attr('r')).replace(/\d+$/, '') + rowIndex);
      });

      currentRow.after(tempRow);

      currentRow = tempRow;
      rowIndex++;
    }

    currentRow = templateRow;
  } else if (reportData.establishments.length === 0) {
    templateRow.remove();
    rowIndex = 13;
  }

  //fix the last row in the table
  workplacesSheet('sheetData row:last-child').attr('r', rowIndex);

  //fix the dimensions tag value
  const dimension = workplacesSheet('dimension');
  dimension.attr('ref', String(dimension.attr('ref')).replace(/\d+$/, '') + rowIndex);

  //keep track of the totals for later
  const totals = {
    numberOfVacancies: 0,
    numberOfLeavers: 0,
    numberOfStarters: 0,
    numberOfStaffRecords: 0,
    numberOfIndividualStaffRecords: 0,
    numberOfStaffRecordsNotAgency: 0,
    numberOfCompleteStaffNotAgency: 0,
    numberOfAgencyStaffRecords: 0,
    numberOfCompleteAgencyStaffRecords: 0,
    workplaceComplete: true,
  };

  //update the cell values
  for (let row = 0; row < reportData.establishments.length; row++) {
    debuglog('updating establishment', row);

    const rowType = row === 0 ? 'ESTFIRST' : row === reportData.establishments.length - 1 ? 'ESTLAST' : 'ESTREGULAR';

    for (let column = 0; column < 24; column++) {
      const columnText = String.fromCharCode(column + 65);
      let isRed = false;

      const cellToChange = currentRow.children(`c[r='${columnText}${row + 13}']`);

      switch (columnText) {
        case 'A':
          {
            putString(cellToChange, reportData.establishments[row].workplaceName);

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'B':
          {
            putString(cellToChange, reportData.establishments[row].workplaceId);

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'C':
          {
            putString(cellToChange, moment(reportData.establishments[row].lastUpdated).format('DD/MM/YYYY'));

            if (
              !moment(reportData.establishments[row].lastUpdated).isBetween(
                moment(fromDate).subtract(1, 'd'),
                moment(toDate).add(1, 'd'),
              )
            ) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'E':
          {
            putString(cellToChange, reportData.establishments[row].establishmentType);

            if (!String(reportData.establishments[row].establishmentType).toLowerCase().includes('local authority')) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'F':
          {
            putString(cellToChange, reportData.establishments[row].mainService);

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'G':
          {
            putString(cellToChange, reportData.establishments[row].serviceUserGroups);

            if (reportData.establishments[row].serviceUserGroups === 'Missing') {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'H':
          {
            putString(cellToChange, reportData.establishments[row].capacityOfMainService);

            if (reportData.establishments[row].capacityOfMainService === 'Missing') {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'I':
          {
            putString(cellToChange, reportData.establishments[row].utilisationOfMainService);

            if (reportData.establishments[row].utilisationOfMainService === 'Missing') {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'J':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfVacancies,
              columnText,
              rowType,
            );

            totals.numberOfVacancies += parseInt(reportData.establishments[row].numberOfVacancies, 10) || 0;
          }
          break;

        case 'K':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfLeavers,
              columnText,
              rowType,
            );

            totals.numberOfLeavers += parseInt(reportData.establishments[row].numberOfLeavers, 10) || 0;
          }
          break;

        case 'L':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfStarters,
              columnText,
              rowType,
            );

            totals.numberOfStarters += parseInt(reportData.establishments[row].numberOfStarters, 10) || 0;
          }
          break;

        case 'M':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfStaffRecords,
              columnText,
              rowType,
            );

            totals.numberOfStaffRecords += parseInt(reportData.establishments[row].numberOfStaffRecords, 10) || 0;
          }
          break;

        case 'N':
        case 'O':
          {
            putString(cellToChange, '');

            setStyle(cellToChange, columnText, rowType, false);
          }
          break;

        case 'P':
          {
            putString(cellToChange, reportData.establishments[row].workplaceComplete ? 'Yes' : 'No');

            if (!reportData.establishments[row].workplaceComplete) {
              isRed = true;
              totals.workplaceComplete = false;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'Q':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfIndividualStaffRecords,
              columnText,
              rowType,
            );

            totals.numberOfIndividualStaffRecords +=
              parseInt(reportData.establishments[row].numberOfIndividualStaffRecords, 10) || 0;
          }
          break;

        case 'R':
          {
            let value = reportData.establishments[row].percentageOfStaffRecords;

            if (!isNumberRegex.test(String(value))) {
              value = 'Missing';
            }

            putString(cellToChange, value);

            if (value === 'Missing' || value < 90 || value > 100) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'S':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfStaffRecordsNotAgency,
              columnText,
              rowType,
            );

            totals.numberOfStaffRecordsNotAgency +=
              parseInt(reportData.establishments[row].numberOfStaffRecordsNotAgency, 10) || 0;
          }
          break;

        case 'T':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfCompleteStaffNotAgency,
              columnText,
              rowType,
            );

            totals.numberOfCompleteStaffNotAgency +=
              parseInt(reportData.establishments[row].numberOfCompleteStaffNotAgency, 10) || 0;
          }
          break;

        case 'U':
          {
            let value = reportData.establishments[row].percentageOfCompleteStaffRecords;

            if (!isNumberRegex.test(String(value))) {
              value = 'Missing';
            }

            putString(cellToChange, value);

            if (value === 'Missing' || value < 90 || value > 100) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'V':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfAgencyStaffRecords,
              columnText,
              rowType,
            );

            totals.numberOfAgencyStaffRecords +=
              parseInt(reportData.establishments[row].numberOfAgencyStaffRecords, 10) || 0;
          }
          break;

        case 'W':
          {
            basicValidationUpdate(
              putString,
              cellToChange,
              reportData.establishments[row].numberOfCompleteAgencyStaffRecords,
              columnText,
              rowType,
            );

            totals.numberOfCompleteAgencyStaffRecords +=
              parseInt(reportData.establishments[row].numberOfCompleteAgencyStaffRecords, 10) || 0;
          }
          break;

        case 'X':
          {
            let value = reportData.establishments[row].percentageOfCompleteAgencyStaffRecords;

            if (!isNumberRegex.test(String(value))) {
              value = 'Missing';
            }

            putString(cellToChange, value);

            if (value === 'Missing' || value < 90 || value > 100) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;
      }
    }

    currentRow = currentRow.next();
  }

  //update totals
  const rowType = 'ESTTOTAL';
  for (let column = 0; column < 24; column++) {
    debuglog('updating establishment totals');

    const columnText = String.fromCharCode(column + 65);

    const cellToChange = workplacesSheet(`c[r='${columnText}12']`);

    switch (columnText) {
      case 'J':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfVacancies, columnText, rowType);
        }
        break;

      case 'K':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfLeavers, columnText, rowType);
        }
        break;

      case 'L':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfStarters, columnText, rowType);
        }
        break;

      case 'M':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfStaffRecords, columnText, rowType);
        }
        break;

      case 'N':
      case 'O':
        {
          putString(cellToChange, '');

          setStyle(cellToChange, columnText, rowType, false);
        }
        break;

      case 'P':
        {
          let isRed = false;

          putString(cellToChange, totals.workplaceComplete ? 'Yes' : 'No');

          if (!totals.workplaceComplete) {
            isRed = true;
          }

          setStyle(cellToChange, columnText, rowType, isRed);
        }
        break;

      case 'Q':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfIndividualStaffRecords, columnText, rowType);
        }
        break;

      case 'R':
        {
          basicValidationUpdate(
            putString,
            cellToChange,
            (totals.numberOfIndividualStaffRecords / totals.numberOfStaffRecords) * 100,
            columnText,
            rowType,
          );
        }
        break;

      case 'S':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfStaffRecordsNotAgency, columnText, rowType);
        }
        break;

      case 'T':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfCompleteStaffNotAgency, columnText, rowType);
        }
        break;

      case 'U':
        {
          basicValidationUpdate(
            putString,
            cellToChange,
            (totals.numberOfCompleteStaffNotAgency / totals.numberOfStaffRecordsNotAgency) * 100,
            columnText,
            rowType,
          );
        }
        break;

      case 'V':
        {
          basicValidationUpdate(putString, cellToChange, totals.numberOfAgencyStaffRecords, columnText, rowType);
        }
        break;

      case 'W':
        {
          basicValidationUpdate(
            putString,
            cellToChange,
            totals.numberOfCompleteAgencyStaffRecords,
            columnText,
            rowType,
          );
        }
        break;

      case 'X':
        {
          basicValidationUpdate(
            putString,
            cellToChange,
            (totals.numberOfCompleteAgencyStaffRecords / totals.numberOfAgencyStaffRecords) * 100,
            columnText,
            rowType,
          );
        }
        break;
    }
  }

  debuglog('establishments updated');

  return workplacesSheet;
};

const redIifMissing = (putString, cellToChange, value, columnText, rowType, columnObj = {}) => {
  let isRed = false;
  if (String(value) === 'Missing') {
    isRed = true;
  }
  if (Object.keys(columnObj).length !== 0) {
    let currentRowObj = columnObj.reportObj[columnObj.index];
    if (currentRowObj.employmentStatus === 'Pool/Bank' || currentRowObj.employmentStatus === 'Agency') {
      if (currentRowObj.sickDays === 'Missing') {
        isRed = false;
      }
    }
  }

  putString(cellToChange, value);

  setStyle(cellToChange, columnText, rowType, isRed);
};

const updateStaffRecordsSheet = (staffRecordsSheet, reportData, sharedStrings, sst, sharedStringsUniqueCount) => {
  debuglog('updating staff sheet');

  const putString = putStringTemplate.bind(null, staffRecordsSheet, sharedStrings, sst, sharedStringsUniqueCount);

  putString(staffRecordsSheet("c[r='B5']"), moment(reportData.date).format('DD/MM/YYYY'));

  putString(staffRecordsSheet("c[r='B6']"), reportData.reportEstablishment.localAuthority);

  putString(staffRecordsSheet("c[r='B7']"), reportData.reportEstablishment.name);

  // clone the row the apropriate number of times
  const templateRow = staffRecordsSheet("row[r='11']");
  let currentRow = templateRow;
  let rowIndex = 12;

  if (reportData.workers.length > 1) {
    for (let i = 0; i < reportData.workers.length - 1; i++) {
      const tempRow = templateRow.clone(true);

      tempRow.attr('r', rowIndex);

      tempRow.children('c').each((index, elem) => {
        staffRecordsSheet(elem).attr('r', String(staffRecordsSheet(elem).attr('r')).replace(/\d+$/, '') + rowIndex);
      });

      currentRow.after(tempRow);

      currentRow = tempRow;
      rowIndex++;
    }

    currentRow = templateRow;
  } else if (reportData.workers.length === 0) {
    templateRow.remove();
    rowIndex = 11;
  }

  //fix the last row in the table
  staffRecordsSheet('sheetData row:last-child').attr('r', rowIndex);

  //fix the dimensions tag value
  const dimension = staffRecordsSheet('dimension');
  dimension.attr('ref', String(dimension.attr('ref')).replace(/\d+$/, '') + rowIndex);

  //update the cell values
  for (let row = 0; row < reportData.workers.length; row++) {
    debuglog('updating worker', row);

    const rowType = row === reportData.workers.length - 1 ? 'WORKERLAST' : 'WORKERREGULAR';

    for (let column = 0; column < 18; column++) {
      const columnText = String.fromCharCode(column + 65);

      const cellToChange = currentRow.children(`c[r='${columnText}${row + 11}']`);

      switch (columnText) {
        case 'A':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].localId, columnText, rowType);
          }
          break;

        case 'B':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].workplaceName, columnText, rowType);
          }
          break;

        case 'D':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].workplaceId, columnText, rowType);
          }
          break;

        case 'E':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].gender, columnText, rowType);
          }
          break;

        case 'F':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].dateOfBirth, columnText, rowType);
          }
          break;

        case 'G':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].ethnicity, columnText, rowType);
          }
          break;

        case 'H':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].mainJob, columnText, rowType);
          }
          break;

        case 'I':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].employmentStatus, columnText, rowType);
          }
          break;

        case 'J':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].contractedAverageHours, columnText, rowType);
          }
          break;

        case 'K':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].sickDays, columnText, rowType, {
              reportObj: reportData.workers,
              index: row,
            });
          }
          break;

        case 'L':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].payInterval, columnText, rowType);
          }
          break;

        case 'M':
          {
            redIifMissing(putString, cellToChange, reportData.workers[row].rateOfPay, columnText, rowType);
          }
          break;

        case 'N':
          {
            let isRed = false;
            let value = String(reportData.workers[row].relevantSocialCareQualification);

            switch (value.toLowerCase()) {
              case 'must be yes':
                {
                  isRed = true;
                  value = 'No';
                }
                break;

              case 'missing':
                {
                  isRed = true;
                }
                break;
            }

            putString(cellToChange, value);

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'O':
          {
            redIifMissing(
              putString,
              cellToChange,
              reportData.workers[row].highestSocialCareQualification,
              columnText,
              rowType,
            );
          }
          break;

        case 'P':
          {
            redIifMissing(
              putString,
              cellToChange,
              reportData.workers[row].nonSocialCareQualification,
              columnText,
              rowType,
            );
          }
          break;

        case 'Q':
          {
            let isRed = false;

            putString(cellToChange, moment(reportData.workers[row].lastUpdated).format('DD/MM/YYYY'));

            if (
              !moment(reportData.workers[row].lastUpdated).isBetween(
                moment(fromDate).subtract(1, 'd'),
                moment(toDate).add(1, 'd'),
              )
            ) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;

        case 'R':
          {
            let isRed = false;

            putString(cellToChange, reportData.workers[row].staffRecordComplete ? 'Yes' : 'No');

            if (!reportData.workers[row].staffRecordComplete) {
              isRed = true;
            }

            setStyle(cellToChange, columnText, rowType, isRed);
          }
          break;
      }
    }

    currentRow = currentRow.next();
  }

  debuglog('workers updated');

  return staffRecordsSheet;
};

const getReport = async (date, thisEstablishment) => {
  let reportData = await LAReport.run(date, thisEstablishment);
  if (reportData === null) {
    return null;
  }

  return new Promise((resolve) => {
    const thePath = path.join(__dirname, folderName);
    const walker = walk.walk(thePath);
    const outputZip = new JsZip();

    let workplacesSheet, staffRecordsSheet, sharedStrings;

    debuglog('iterating filesystem', thePath);

    walker.on('file', (root, fileStats, next) => {
      const pathName = root.replace(thePath, '').replace('\\', '/').replace(/^\//, '');
      const zipPath = pathName === '' ? fileStats.name : path.join(pathName, fileStats.name);
      const readPath = path.join(thePath, zipPath);

      debuglog('file found', readPath);

      fs.readFile(`${readPath}`, (err, fileContent) => {
        debuglog('content read', zipPath);

        if (!err) {
          switch (zipPath) {
            case workplacesSheetName:
              {
                workplacesSheet = parseXML(fileContent);
              }
              break;

            case staffRecordsSheetName:
              {
                staffRecordsSheet = parseXML(fileContent);
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

        //update the workplaces sheet with the report data and add it to the zip
        outputZip.file(
          workplacesSheetName,
          updateWorkplacesSheet(
            workplacesSheet,
            reportData,
            sharedStrings,
            sst,
            sharedStringsUniqueCount, //pass unique count by reference rather than by value
          ).xml(),
        );

        //update the staff records sheet with the report data and add it to the zip
        outputZip.file(
          staffRecordsSheetName,
          updateStaffRecordsSheet(
            staffRecordsSheet,
            reportData,
            sharedStrings,
            sst,
            sharedStringsUniqueCount, //pass unique count by reference rather than by value
          ).xml(),
        );

        //update the shared strings counts we've been keeping track of
        sst.attr('uniqueCount', sharedStringsUniqueCount[0]);
        sst.attr('count', sharedStringsCount[0]);

        //add the updated shared strings to the zip
        outputZip.file(sharedStringsName, sharedStrings.xml());
      }

      debuglog('LA user report: creating zip file');

      resolve(outputZip);
    });
  }).then((outputZip) =>
    outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    }),
  );
};

// gets report
// NOTE - the Local Authority report is driven mainly by pgsql (postgres functions) and therefore does not
//    pass through the Establishment/Worker entities. This is done for performance, as these reports
//    are expected to operate across large sets of data

const reportGet = async (req, res) => {
  try {
    // first ensure this report can only be ran by those establishments with a Local Authority employer type
    const thisEstablishment = new Establishment(req.username);
    if (await thisEstablishment.restore(req.establishment.id, false)) {
      const theEmployerType = thisEstablishment.employerType;

      if (theEmployerType && theEmployerType.value.startsWith('Local Authority')) {
        const date = new Date();
        const report = await getReport(date, thisEstablishment);
        if (report) {
          await reportLock.saveResponse(req, res, 200, report, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-disposition': `attachment; filename=${moment(date).format(
              'YYYY-MM-DD',
            )}-SFC-Local-Authority-Report.xlsx`,
          });
        } else {
          // only allow on those establishments being a parent

          console.error('report/localAuthority/user 503 response');
          await reportLock.saveResponse(req, res, 503, {});
        }
      } else {
        console.error('report/localAuthority/user 403 response');
        await reportLock.saveResponse(req, res, 403, {});
      }
    } else {
      // only allow on those establishments being a local authority

      console.error('report/localAuthority/user - failed restoring establishment');
      await reportLock.saveResponse(req, res, 503, {});
    }
  } catch (err) {
    console.error('report/localAuthority/user - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
};

router.route('/report').get(reportLock.acquireLock.bind(null, 'la', reportGet, false));
router.route('/lockstatus').get(reportLock.lockStatusGet.bind(null, 'la', false));
router.route('/unlock').get(reportLock.releaseLock.bind(null, 'la', false));
router.route('/response/:buRequestId').get(reportLock.responseGet);

module.exports = router;
module.exports.identifyLocalAuthority = identifyLocalAuthority;

// Local Authority user's report
'use strict';

//external node modules
const moment = require('moment');
const fs = require('fs');
const walk = require('walk');
const JsZip = new require('jszip');

//Constants string needed by this file in several places
const folderName = 'template';
const overviewSheetName = 'xl/worksheets/sheet1.xml';
const establishmentsSheetName = 'xl/worksheets/sheet2.xml';
const workersSheetName = 'xl/worksheets/sheet3.xml';
const sharedStringsName = 'xl/sharedStrings.xml';
const schema = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const isNumberRegex = /^[0-9]+(\.[0-9]+)?$/;
//const debuglog = console.log.bind(console);
const debuglog = () => {};

//XML DOM manipulation helper functions
const { DOMParser, XMLSerializer } = new (require('jsdom').JSDOM)().window;

const parseXML = fileContent =>
  (new DOMParser()).parseFromString(fileContent.toString('utf8'), "application/xml");

const serializeXML = dom =>
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  (new XMLSerializer()).serializeToString(dom);

//helper function to set a spreadsheet cell's value
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

  if(!hasVTag) {
    vTag = sheetDoc.createElementNS(schema, 'v');

    element.appendChild(vTag);
  }

  if(isNumber) {
    element.removeAttribute('t');
    vTag.textContent = textValue;
  }
  else{
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

const getReportData = async (date, establishmentId) => {
  debuglog("wdf parent excel report data started:", params);

  const reportData = {
    date: date.toISOString()
    parentName: 'Parent Name'
    
    establishments: [{
      //overview tab
      subsidiaryName: 'Subsidiary Name',
      subsidiarySharingPermissions: false,
      currentWdfEligibilityStatus: false,
      dateEligibilityAchieved: '2019-09-18',
      isDataFullyCompleted: false,
      updatedInCurrentFinancialYear: false,
      totalWorkersCount: 10,
      workerRecordsCount: 9,
      completedWorkerRecordsCount: 8,
      completedWorkerRecordsPercentage: 100.0,

      //establishments tab
      establishmentType: 'Establishment Type',
      mainService: 'Main Service',
      mainServiceCapacity: 10,
      mainServiceUtilisation: 9,
      otherServices: 'Other Services',
      serviceUsers: 'Service Users' 
      investorsInPeopleStatus: false,
      updatedLastDate: '2017-09-19',
      workersWithRecordsPercentage: 90.0,
      startersInLast12Months: 5,
      leaversInLast12Months: 6,
      vacanciesOnCompletionDateCount: 1,
      leavingReasonsCountEqualsLeavers: true,
      leavingDestinationCountEqualsLeavers: true,
      startersByJobRoleCountEqualsTotalStarters: true,
      leaversByJobRoleEqualsTotalLeavers: true,
      vacanciesByJobRoleEqualsTotalVacancies: true,
      totalWorkersCountGTEWorkerRecords: false
    }],
    
    workers: [{
      localId: 'Local Id',
      subsidiaryName: 'Subsidary Name',
      gender: 'Gender',
      dateOfBirth: '2019-09-17',
      nationality: 'Nationality',
      mainJobRole: 'Main Job Role',
      mainJobDateStarted: '2019-09-19',
      recruitmentSource: 'Recruitment Source',
      employmentStatus: 'Employment Status',
      contractedHours: '37.5',
      additionalHours: '0',
      fullTimeStatus: 'Full Time Status',
      isZeroHoursContract: false,
      sicknessDays: '1'
      payInterval: 'Pay Interval'
      rateOfPay: '60',
      inductionStatus: 'Induction Status',
      careCertificate: 'Care Certificate',
      highestQualificationHeld: 'Highest Qualification Held',
      lastFullyUpdatedDate: '2019-09-19'
    }]
  };


  debuglog("LA user report data finished:", params, reportData.establishments.length, reportData.workers.length);

  return reportData;
};

const styleLookup = {
  'BLACK': {
    'ESTFIRST': {
      'A': 2,
      'B': 2,
      'C': 2,
      'D': 2,
      'E': 2,
      'F': 2,
      'G': 2,
      'H': 2,
      'I': 2,
      'J': 2,
      'K': 2,
      'L': 2,
      'M': 2,
      'N': 2,
      'O': 2,
      'P': 2,
      'Q': 2,
      'R': 2,
      'S': 2,
      'T': 2,
      'U': 2,
      'V': 2,
      'W': 2,
      'X': 2
    },
    'ESTLAST' : {
      'A': 2,
      'B': 2,
      'C': 2,
      'D': 2,
      'E': 2,
      'F': 2,
      'G': 2,
      'H': 2,
      'I': 2,
      'J': 2,
      'K': 2,
      'L': 2,
      'M': 2,
      'N': 2,
      'O': 2,
      'P': 2,
      'Q': 2,
      'R': 2,
      'S': 2,
      'T': 2,
      'U': 2,
      'V': 2,
      'W': 2,
      'X': 2
    }
  },
  'RED': {
    'ESTFIRST': {
      'A': 2,
      'B': 2,
      'C': 2,
      'D': 2,
      'E': 2,
      'F': 2,
      'G': 2,
      'H': 2,
      'I': 2,
      'J': 2,
      'K': 2,
      'L': 2,
      'M': 2,
      'N': 2,
      'O': 2,
      'P': 2,
      'Q': 2,
      'R': 2,
      'S': 2,
      'T': 2,
      'U': 2,
      'V': 2,
      'W': 2,
      'X': 2
    },
    'ESTLAST' : {
      'A': 2,
      'B': 2,
      'C': 2,
      'D': 2,
      'E': 2,
      'F': 2,
      'G': 2,
      'H': 2,
      'I': 2,
      'J': 2,
      'K': 2,
      'L': 2,
      'M': 2,
      'N': 2,
      'O': 2,
      'P': 2,
      'Q': 2,
      'R': 2,
      'S': 2,
      'T': 2,
      'U': 2,
      'V': 2,
      'W': 2,
      'X': 2
    }
  }
};

const setStyle = (cellToChange, columnText, rowType, isRed) => {
  cellToChange.setAttribute('s', styleLookup[isRed ? 'RED' : 'BLACK'][rowType][columnText]);
};

const updateWorkplacesSheet = (
    workplacesSheet,
    reportData,
    sharedStrings,
    sst,
    sharedStringsUniqueCount
) => {
  debuglog("updating workplaces sheet");

  const putString = putStringTemplate.bind(null, workplacesSheet, sharedStrings, sst, sharedStringsUniqueCount);

  //set headers
  putString(
      workplacesSheet.querySelector("c[r='B5']"),
      moment(reportData.date).format("DD/MM/YYYY")
    );

  // clone the row the apropriate number of times
  const templateRow = workplacesSheet.querySelector("row[r='13']");
  let currentRow = templateRow;
  let rowIndex = 14;

  if(reportData.establishments.length > 1) {
    for(let i = 0; i < reportData.establishments.length-1; i++) {
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
  else if(reportData.establishments.length === 0) {
    templateRow.remove();
    rowIndex = 13;
  }

  //fix the last row in the table
  workplacesSheet.querySelector("sheetData row:last-child").setAttribute('r', rowIndex);

  //fix the dimensions tag value
  const dimension = workplacesSheet.querySelector("dimension");
  dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, "") + rowIndex);

  //update the cell values
  for(let row = 0; row < reportData.establishments.length; row++) {
    debuglog("updating establishment", row);

    const rowType = row === reportData.establishments.length - 1 ? 'ESTLAST' : 'ESTREGULAR';
    let nextSibling = {};

    for(let column = 0; column < 24; column++) {
      const columnText = String.fromCharCode(column + 65);
      let isRed = false;

      const cellToChange = (typeof nextSibling.querySelector === 'function') ? nextSibling : currentRow.querySelector(`c[r='${columnText}${row+13}']`);

      switch(columnText) {
        case 'A': {
        } break;

        case 'B': {
        } break;

        case 'C': {
        } break;

        case 'D': {
        } break;

        case 'E': {
        } break;

        case 'F': {
        } break;

        case 'G': {
        } break;

        case 'H': {
        } break;

        case 'I': {
        } break;

        case 'J': {
        } break;

        case 'K': {
        } break;

        case 'L': {
        } break;

        case 'M': {
        } break;

        case 'N': {
        } break;
      
        case 'O': {
        } break;

        case 'P': {
        } break;

        case 'Q': {
        } break;

        case 'R': {
        } break;

        case 'S': {
        } break;

        case 'T': {
        } break;

        case 'U': {
        } break;

        case 'V': {
        } break;

        case 'W': {
        } break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog("establishments updated");

  return workplacesSheet;
};

const getReport = async (date, thisEstablishment) => {
  let reportData = await getReportData(date, thisEstablishment);

  if(reportData === null) {
    return null;
  }

  return (new Promise(resolve => {
      const thePath = `${__dirname}/${folderName}`
      const walker = walk.walk(thePath);
      const outputZip = new JsZip();

      let overviewSheet, establishmentsSheetstaffRecordsSheet, sharedStrings;

      debuglog("iterating filesystem", thePath);

      walker.on("file", (root, fileStats, next) => {
        const pathName = root.replace(thePath, '').replace(/^\//, "");
        const zipPath = (pathName === '' ? '' : pathName + '/') + fileStats.name;

        debuglog("file found", `${thePath}/${zipPath}`);

        fs.readFile(`${thePath}/${zipPath}`, (err, fileContent) => {
          debuglog("content read", zipPath);

          if(!err) {
            switch(zipPath) {
              case workplacesSheetName: {
                workplacesSheet = parseXML(fileContent);
              } break;

              case workplacesSheetName: {
                workplacesSheet = parseXML(fileContent);
              } break;


              case staffRecordsSheetName: {
                staffRecordsSheet = parseXML(fileContent);
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

      walker.on("end", () => {
        debuglog("all files read");

        if(sharedStrings) {
          const sst = sharedStrings.querySelector("sst");

          const sharedStringsUniqueCount = [parseInt(sst.getAttribute('uniqueCount'), 10)];

          //update the overview sheet with the report data and add it to the zip
          outputZip.file(workplacesSheetName, serializeXML(updateWorkplacesSheet(
              workplacesSheet,
              reportData,
              sharedStrings,
              sst,
              sharedStringsUniqueCount  //pass unique count by reference rather than by value
            )));

          //update the establishments sheet with the report data and add it to the zip
          outputZip.file(staffRecordsSheetName, serializeXML(updateStaffRecordsSheet(
              staffRecordsSheet,
              reportData,
              sharedStrings,
              sst,
              sharedStringsUniqueCount  //pass unique count by reference rather than by value
            )));

          //update the workplaces sheet with the report data and add it to the zip
          outputZip.file(staffRecordsSheetName, serializeXML(updateStaffRecordsSheet(
              staffRecordsSheet,
              reportData,
              sharedStrings,
              sst,
              sharedStringsUniqueCount  //pass unique count by reference rather than by value
            )));

          //update the shared strings counts we've been keeping track of
          sst.setAttribute('uniqueCount', sharedStringsUniqueCount[0]);

          //add the updated shared strings to the zip
          outputZip.file(sharedStringsName, serializeXML(sharedStrings));
        }

        debuglog("wdf parent report: creating zip file");

        resolve(outputZip);
      });
    })).

    then(outputZip => outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    }));
};

// gets report
// NOTE - the Local Authority report is driven mainly by pgsql (postgres functions) and therefore does not
//    pass through the Establishment/Worker entities. This is done for performance, as these reports
//    are expected to operate across large sets of data
const express = require('express');
const router = express.Router();

router.route('/').get(async (req, res) => {
  req.setTimeout(config.get('app.reports.localAuthority.timeout')*1000);

  try {
    // first ensure this report can only be ran by those establishments with a Local Authority employer type
    const thisEstablishment = new Establishment(req.username);

    if(await thisEstablishment.restore(req.establishment.id, false)) {
      const theEmployerType = thisEstablishment.employerType;

      if(theEmployerType && (theEmployerType.value).startsWith('Local Authority')) {
        const date = new Date();
        const report = await getReport(date, thisEstablishment);

        if(report) {
          res.setHeader('Content-disposition',
            `attachment; filename=${moment(date).format("YYYY-MM-DD")}-SFC-Local-Authority-Report.xlsx`);
          res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Length', report.length);

          console.log("report/localAuthority/user - 200 response");

          return res.status(200).end(report);
        }
        else {
          // failed to run the report
          console.error('report/localAuthority/user - failed to run the report');

          return res.status(503).send('ERR: Failed to run report');
        }
      }
      else {
        // only allow on those establishments being a local authority

        console.log("report/localAuthority/user 403 response");

        return res.status(403).send();
      }
    }
    else {
      console.error('report/localAuthority/user - failed restoring establisment', err);
      return res.status(503).send('ERR: Failed to restore establishment');
    }
  }
  catch(err) {
    console.error('report/localAuthority/user - failed', err);
    return res.status(503).send('ERR: Failed to retrieve report');
  }
});

module.exports = router;

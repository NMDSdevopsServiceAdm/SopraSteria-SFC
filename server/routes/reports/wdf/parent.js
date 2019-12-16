// Local Authority user's report
'use strict';

// external node modules
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const walk = require('walk');
const JsZip = require('jszip');
const config = rfr('server/config/config');
const uuid = require('uuid');

const s3 = new (require('aws-sdk')).S3({
  region: String(config.get('bulkupload.region'))
});
const Bucket = String(config.get('bulkupload.bucketname'));

const { Establishment } = require('../../../models/classes/establishment');
const { getEstablishmentData, getWorkerData, getCapicityData, getUtilisationData, getServiceCapacityDetails } = rfr('server/data/parentWDFReport');
const { attemptToAcquireLock, updateLockState, lockStatus, releaseLockQuery } = rfr('server/data/parentWDFReportLock');

// Constants string needed by this file in several places
const folderName = 'template';
const overviewSheetName = path.join('xl', 'worksheets', 'sheet1.xml');
const establishmentsSheetName = path.join('xl', 'worksheets', 'sheet2.xml');
const workersSheetName = path.join('xl', 'worksheets', 'sheet3.xml');
const sharedStringsName = path.join('xl', 'sharedStrings.xml');
const schema = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const isNumberRegex = /^[0-9]+(\.[0-9]+)?$/;
//const debuglog = console.log.bind(console);
const debuglog = () => {};

const buStates = [
  'READY',
  'DOWNLOADING',
  'FAILED',
  'WARNINGS',
  'PASSED',
  'COMPLETING'
].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

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
  debuglog('wdf parent excel report data started:', thisEstablishment);

  return {
    date: date.toISOString(),
    parentName: thisEstablishment.name,
    establishments: await getEstablishmentReportData(thisEstablishment.id),
    workers: await getWorkersReportData(thisEstablishment.id)
  };
};

const propsNeededToComplete = ('MainService,EmployerTypeValue,Capacities,ServiceUsers,' +
'NumberOfStaffValue').split(',');

const getEstablishmentReportData = async establishmentId => {
  const establishmentData = await getEstablishmentData(establishmentId);
  for(let i = 0; i< establishmentData.length; i++) {
    let value = establishmentData[i];
    let getServiceCapacityData = await getServiceCapacityDetails(value.MainServiceFKValue);
    if(getServiceCapacityData && getServiceCapacityData.length === 0){
      value.Capacities = 'N/A';
      value.Utilisations = 'N/A';
    }else{
      let capicityDetails = [];
      let utilisationDetails = [];
      if(getServiceCapacityData.length === 2){
        capicityDetails = await getCapicityData(value.EstablishmentID, value.MainServiceFKValue);
        utilisationDetails = await getUtilisationData(value.EstablishmentID, value.MainServiceFKValue);
      }else if(getServiceCapacityData[0].Type === 'Capacity'){
        capicityDetails = await getCapicityData(value.EstablishmentID, value.MainServiceFKValue);
        utilisationDetails = [{"Answer": 'N/A'}];
      }else if(getServiceCapacityData[0].Type === 'Utilisation'){
        utilisationDetails = await getUtilisationData(value.EstablishmentID, value.MainServiceFKValue);
        capicityDetails = [{"Answer": 'N/A'}];
      }

      if(capicityDetails && capicityDetails.length > 0){
        if(capicityDetails[0].Answer === null){
          value.Capacities = 'Missing';
        }else if(capicityDetails[0].Answer === 'N/A'){
          value.Capacities = 'N/A';
        }else{
          value.Capacities = capicityDetails[0].Answer;
        }
      }else{
        value.Capacities = 'Missing';
      }
      if(utilisationDetails && utilisationDetails.length > 0){
        if(utilisationDetails[0].Answer === null){
          value.Utilisations = 'Missing';
        }else if(utilisationDetails[0].Answer === 'N/A'){
          value.Utilisations = 'N/A';
        }else{
          value.Utilisations = utilisationDetails[0].Answer;
        }
      }else{
        value.Utilisations = 'Missing';
      }
    }
    if (value.ShareDataWithCQC && value.ShareDataWithLA) {
      value.SubsidiarySharingPermissions = 'All';
    } else if (value.ShareDataWithCQC && !value.ShareDataWithLA) {
      value.SubsidiarySharingPermissions = 'CQC';
    } else if (!value.ShareDataWithCQC && value.ShareDataWithLA) {
      value.SubsidiarySharingPermissions = 'LA';
    } else {
      value.SubsidiarySharingPermissions = 'None';
    }

    value.EstablishmentDataFullyCompleted = 'Yes';

    propsNeededToComplete.forEach(prop => {
      if (value[prop] === null) {
        value.EstablishmentDataFullyCompleted = 'No';
      }
    });

    value.CurrentWdfEligibilityStatus = value.CurrentWdfEligibilityStatus === null ? 'Not Eligible' : 'Eligible';

    if (value.DateEligibilityAchieved === null) {
      value.DateEligibilityAchieved = '';
    }

    value.NumberOfStaffValue = (value.NumberOfStaffValue === null) ? 0: value.NumberOfStaffValue;

    if (
      value.NumberOfStaffValue !== 0 &&
      value.NumberOfStaffValue !== null &&
      (value.TotalIndividualWorkerRecord !== 0 || value.TotalIndividualWorkerRecord !== null)) {
      value.PercentageOfWorkerRecords = `${parseFloat(+value.TotalIndividualWorkerRecord / +value.NumberOfStaffValue * 100).toFixed(1)}%`;
    } else {
      value.PercentageOfWorkerRecords = '0.0%';
    }

    if(value.VacanciesValue === 'None' || value.VacanciesValue === null){
      value.Vacancies = 0;
    }else if(value.VacanciesValue === "Don't know"){
      value.Vacancies =  "Don't know";
    }else if(value.VacanciesValue === "With Jobs"){
      value.Vacancies = (value.VacanciesCount === null)? 'Missing':  value.VacanciesCount;
    }

    if(value.StartersValue === 'None' || value.StartersValue === null){
      value.Starters = 0;
    }else if(value.StartersValue === "Don't know"){
      value.Starters =  "Don't know";
    }else if(value.StartersValue === "With Jobs"){
      value.Starters = (value.StartersCount === null)? 'Missing':  value.StartersCount;
    }

    if(value.LeaversValue === 'None' || value.LeaversValue === null){
      value.Leavers = 0;
    }else if(value.LeaversValue === "Don't know"){
      value.Leavers =  "Don't know";
    }else if(value.LeaversValue === "With Jobs"){
      value.Leavers = (value.LeaversCount === null)? 'Missing':  value.LeaversCount;
    }

    if(value.EmployerTypeValue === null){
      value.EmployerTypeValue = '';
    }

    if(value.ServiceUsers === ''){
      value.ServiceUsers = 'Missing';
    }else{
      value.ServiceUsers = 'Yes';
    }

    value.LeavingReasonsCountEqualsLeavers = (value.ReasonsForLeaving === value.LeaversValue) ? 'Yes' : 'No';
    value.TotalWorkersCountGTEWorkerRecords = (value.NumberOfStaffValue >= value.TotalIndividualWorkerRecord) ? 'Yes' : 'No';

    value.UpdatedInCurrentFinancialYear = value.LastUpdatedDate !== null ? 'Yes' : 'No';

    value.CompletedWorkerRecordsPercentage =
      (value.CompletedWorkerRecords === 0 || value.NumberOfStaffValue === 0 || value.NumberOfStaffValue === null)
        ? '0.0%'
        : `${parseFloat(+value.CompletedWorkerRecords / +value.NumberOfStaffValue * 100).toFixed(1)}%`;
  }

  return establishmentData;
};

const updateProps = ('DateOfBirthValue,GenderValue,NationalityValue,MainJobStartDateValue,' +
'RecruitedFromValue,WeeklyHoursContractedValue,ZeroHoursContractValue,' +
'DaysSickValue,AnnualHourlyPayValue,AnnualHourlyPayRate,CareCertificateValue,QualificationInSocialCareValue,QualificationInSocialCare,OtherQualificationsValue').split(',');

const getWorkersReportData = async establishmentId => {
  const workerData = await getWorkerData(establishmentId);
  let workersArray = workerData.
      filter(worker => {
        if(establishmentId !== worker.EstablishmentID){
          return (worker.DataOwner === 'Parent' || worker.DataPermissions === "Workplace and Staff")
        }else{
          return true;
        }
      });

  workersArray.forEach((value, key) => {
    if(value.QualificationInSocialCareValue === 'No' || value.QualificationInSocialCareValue === "Don't know"){
      value.QualificationInSocialCare = 'N/A';
    }
    if(value.AnnualHourlyPayRate === "Don't know" || value.AnnualHourlyPayValue === "Don't know"){
      value.AnnualHourlyPayRate = 'N/A';
    }
    if(value.DaysSickValue === 'No'){
      value.DaysSickValue = "Don't know";
    }else if(value.DaysSickValue === 'Yes'){
      value.DaysSickValue = value.DaysSickDays;
    }

    if(value.RecruitedFromValue === 'No'){
      value.RecruitedFromValue = "Don't know";
    }else if(value.RecruitedFromValue === "Yes"){
      value.RecruitedFromValue = value.From;
    }

    if(value.NationalityValue === "Other"){
      value.NationalityValue = value.Nationality;
    }

    if((value.ContractValue === 'Permanent' || value.ContractValue === 'Temporary')
    && value.ZeroHoursContractValue === 'No'){
      if(value.WeeklyHoursContractedValue === 'Yes'){
        value.HoursValue = value.WeeklyHoursContractedHours;
      }else if(value.WeeklyHoursContractedValue === 'No'){
        value.HoursValue = "Don't know";
      }else if(value.WeeklyHoursContractedValue === null){
        value.HoursValue = 'Missing';
      }
    }else{
      if(value.WeeklyHoursAverageValue === 'Yes'){
        value.HoursValue = value.WeeklyHoursAverageHours;
      }else if(value.WeeklyHoursAverageValue === 'No'){
        value.HoursValue = "Don't know";
      }else if(value.WeeklyHoursAverageValue === null){
        value.HoursValue = 'Missing';
      }
    }

    updateProps.forEach(prop => {
      if (value[prop] === null) {
        value[prop] = 'Missing';
      }
    });
  });

  return workersArray;
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

const updateEstablishmentsSheet = (
  establishmentsSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount,
  thisEstablishment
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
        if(thisEstablishment.id !== est.EstablishmentID){
          return (est.DataOwner === 'Parent' || est.DataPermissions !== "None")
        }else{
          return true;
        }
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

const updateWorkersSheet = (
  workersSheet,
  reportData,
  sharedStrings,
  sst,
  sharedStringsUniqueCount
) => {
  debuglog('updating workers sheet');

  const putString = putStringTemplate.bind(null, workersSheet, sharedStrings, sst, sharedStringsUniqueCount);

  // set headers
  putString(
    workersSheet.querySelector("c[r='B6']"),
    `Parent name : ${reportData.parentName}`
  );

  putString(
    workersSheet.querySelector("c[r='B7']"),
    `Date: ${moment(reportData.date).format('DD/MM/YYYY')}`
  );

  // clone the row the apropriate number of times
  const templateRow = workersSheet.querySelector("row[r='10']");
  let currentRow = templateRow;
  let rowIndex = 11;

  if (reportData.workers.length > 1) {
    for (let i = 0; i < reportData.workers.length - 1; i++) {
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

  // fix the dimensions tag value
  const dimension = workersSheet.querySelector('dimension');
  dimension.setAttribute('ref', String(dimension.getAttribute('ref')).replace(/\d+$/, '') + (rowIndex - 1));

  // update the cell values
  for (let row = 0; row < reportData.workers.length; row++) {
    debuglog('updating worker', row);

    const rowType = row === reportData.workers.length - 1 ? 'WKRLAST' : 'WKRREGULAR';
    let nextSibling = {};

    for (let column = 0; column < 19; column++) {
      const columnText = String.fromCharCode(column + 65);
      let isRed = false;

      const cellToChange = (typeof nextSibling.querySelector === 'function') ? nextSibling : currentRow.querySelector(`c[r='${columnText}${row + 10}']`);

      switch (columnText) {
        case 'B': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].NameOrIdValue,
            columnText,
            rowType
          );
        } break;

        case 'C': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].NameValue,
            columnText,
            rowType
          );
        } break;

        case 'D': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].GenderValue,
            columnText,
            rowType
          );
        } break;

        case 'E': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].DateOfBirthValue,
            columnText,
            rowType
          );
        } break;

        case 'F': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].NationalityValue,
            columnText,
            rowType
          );
        } break;

        case 'G': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].MainJobRole,
            columnText,
            rowType
          );
        } break;

        case 'H': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].MainJobStartDateValue,
            columnText,
            rowType
          );
        } break;

        case 'I': {
          putString(
            cellToChange,
            reportData.workers[row].RecruitedFromValue
          );

          isRed = (reportData.workers[row].RecruitedFromValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'J': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].ContractValue,
            columnText,
            rowType
          );
        } break;

        case 'K': {
          putString(
            cellToChange,
            reportData.workers[row].HoursValue
          );

          isRed = (reportData.workers[row].HoursValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'L': {
          putString(
            cellToChange,
            reportData.workers[row].ZeroHoursContractValue
          );

          isRed = (reportData.workers[row].ZeroHoursContractValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'M': {
          putString(
            cellToChange,
            reportData.workers[row].DaysSickValue
          );

          isRed = (reportData.workers[row].DaysSickValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'N': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].AnnualHourlyPayValue,
            columnText,
            rowType
          );
        } break;

        case 'O': {
          basicValidationUpdate(
            putString,
            cellToChange,
            reportData.workers[row].AnnualHourlyPayRate,
            columnText,
            rowType
          );
        } break;

        case 'P': {
          putString(
            cellToChange,
            reportData.workers[row].CareCertificateValue
          );

          isRed = (reportData.workers[row].CareCertificateValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;

        case 'Q': {
          putString(
            cellToChange,
            reportData.workers[row].QualificationInSocialCareValue
          );

          isRed = (reportData.workers[row].QualificationInSocialCareValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;
        case 'R': {
          putString(
            cellToChange,
            reportData.workers[row].QualificationInSocialCare
          );

          isRed = (reportData.workers[row].QualificationInSocialCare === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;
        case 'S': {
          putString(
            cellToChange,
            reportData.workers[row].OtherQualificationsValue
          );

          isRed = (reportData.workers[row].OtherQualificationsValue === 'Missing');

          setStyle(cellToChange, columnText, rowType, isRed);
        } break;
      }

      nextSibling = cellToChange ? cellToChange.nextSibling : {};
    }

    currentRow = currentRow.nextSibling;
  }

  debuglog('workers updated');

  return workersSheet;
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

    let overviewSheet, establishmentsSheet, workersSheet, sharedStrings;

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

            case establishmentsSheetName: {
              establishmentsSheet = parseXML(fileContent);
            } break;

            case workersSheetName: {
              workersSheet = parseXML(fileContent);
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
        outputZip.file(establishmentsSheetName, serializeXML(updateEstablishmentsSheet(
          establishmentsSheet,
          reportData,
          sharedStrings,
          sst,
          sharedStringsUniqueCount, // pass unique count by reference rather than by value
          thisEstablishment
        )));

        // update the workplaces sheet with the report data and add it to the zip
        outputZip.file(workersSheetName, serializeXML(updateWorkersSheet(
          workersSheet,
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

      debuglog('wdf parent report: creating zip file');

      resolve(outputZip);
    });
  }))

    .then(outputZip => outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    }));
};

// Prevent multiple wdf report requests from being ongoing simultaneously so we can store what was previously the http responses in the S3 bucket
// This function can't be an express middleware as it needs to run both before and after the regular logic
const acquireLock = async function (logic, newState, req, res) {
  const { establishmentId } = req;

  req.startTime = (new Date()).toISOString();

  console.log(`Acquiring lock for establishment ${establishmentId}.`);

  // attempt to acquire the lock
  const currentLockState = await attemptToAcquireLock(establishmentId);

  // if no records were updated the lock could not be acquired
  // Just respond with a 409 http code and don't call the regular logic
  // close the response either way and continue processing in the background
  if (currentLockState[1] === 0) {
    console.log('Lock *NOT* acquired.');
    res
      .status(409)
      .send({
        message: `The lock for establishment ${establishmentId} was not acquired as it's already being held by another ongoing process.`
      });

    return;
  }

  console.log('Lock acquired.', newState);

  let nextState;

  switch (newState) {
    case buStates.DOWNLOADING: {
      // get the current wdf report state
      const currentState = await lockStatus(establishmentId);

      if (currentState.length === 1) {
        // don't update the status for downloads, just hold the lock
        newState = currentState[0].WdfReportState;
        nextState = null;
      } else {
        nextState = buStates.READY;
      }
    } break;

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

  res
    .status(200)
    .send({
      message: `Lock for establishment ${establishmentId} acquired.`,
      requestId: req.buRequestId
    });

  // run whatever the original logic was
  try {
    await logic(req, res);
  } catch (e) {

  }

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
    res
      .status(200)
      .send({
        establishmentId
      });
  }
};

const signedUrlGet = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;

    await saveResponse(req, res, 200, {
      urls: s3.getSignedUrl('putObject', {
        Bucket,
        Key: `${establishmentId}/latest/${moment(date).format('YYYY-MM-DD')}-SFC-Parent-Wdf-Report.xlsx`,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Metadata: {
          username: String(req.username),
          establishmentId: String(establishmentId)
        },
        Expires: config.get('wdfReport.reportSignedUrlExpire')
      })
    });
  } catch (err) {
    console.error('report/wdf/parent:PreSigned - failed', err.message);
    await saveResponse(req, res, 503, {});
  }
};

const saveResponse = async (req, res, statusCode, body, headers) => {
  if (!Number.isInteger(statusCode) || statusCode < 100) {
    statusCode = 500;
  }

  return s3.putObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${req.buRequestId}.json`,
    Body: JSON.stringify({
      url: req.url,
      startTime: req.startTime,
      endTime: (new Date()).toISOString(),
      responseCode: statusCode,
      responseBody: body,
      responseHeaders: (typeof headers === 'object' ? headers : undefined)
    })
  }).promise();
};

const responseGet = (req, res) => {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const buRequestId = String(req.params.buRequestId).toLowerCase();

  if (!uuidRegex.test(buRequestId)) {
    res.status(400).send({
      message: 'request id must be a uuid'
    });

    return;
  }

  s3.getObject({
    Bucket,
    Key: `${req.establishmentId}/intermediary/${buRequestId}.json`
  }).promise()
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
        console.log('wdfReport::responseGet: Response code was not numeric', jsonData);

        throw new Error('Response code was not numeric');
      }
    })
    .catch(err => {
      console.log('wdfReport::responseGet: getting data returned an error:', err);

      res.status(404).send({
        message: 'Not Found'
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
          WdfReportState: buStates.READY,
          WdfReportdLockHeld: true
        } : currentLockState[0]
    );

  return currentLockState[0];
};

const reportGet = async (req, res) => {
  try {
    // first ensure this report can only be run by those establishments that are a parent
    const thisEstablishment = new Establishment(req.username);

    if (await thisEstablishment.restore(req.establishment.id, false)) {
      if (thisEstablishment.isParent) {
        const date = new Date();
        const report = await getReport(date, thisEstablishment);

        if (report) {
          await saveResponse(req, res, 200, report, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-disposition': `attachment; filename=${moment(date).format('YYYY-MM-DD')}-SFC-Parent-Wdf-Report.xlsx`
          });
          console.log('report/wdf/parent - 200 response');
        } else {
          // failed to run the report
          console.error('report/wdf/parent - failed to run the report');
          await saveResponse(req, res, 503, {});
        }
      } else {
        // only allow on those establishments being a parent

        console.log('report/wdf/parent 403 response');
        await saveResponse(req, res, 403, {});
      }
    } else {
      console.error('report/wdf/parent - failed restoring establisment');
      await saveResponse(req, res, 503, {});
    }
  } catch (err) {
    console.error('report/wdf/parent - failed', err);
    await saveResponse(req, res, 503, {});
  }
}

// gets report
// NOTE - the Local Authority report is driven mainly by pgsql (postgres functions) and therefore does not
//    pass through the Establishment/Worker entities. This is done for performance, as these reports
//    are expected to operate across large sets of data
const express = require('express');
const router = express.Router();

router.route('/signedUrl').get(acquireLock.bind(null, signedUrlGet, buStates.DOWNLOADING));
router.route('/report').get(acquireLock.bind(null, reportGet, buStates.DOWNLOADING));
router.route('/lockstatus').get(lockStatusGet);
router.route('/unlock').get(releaseLock);
router.route('/response/:buRequestId').get(responseGet);

module.exports = router;

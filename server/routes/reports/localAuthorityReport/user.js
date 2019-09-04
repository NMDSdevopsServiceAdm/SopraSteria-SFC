// Local Authority user's report

//external node modules
const moment = require('moment');
const fs = require('fs');
const walk = require('walk');
const JsZip = new require('jszip');

//Constants string needed by this file in several places
const folderName = 'template';
const workplacesSheetName = 'xl/worksheets/sheet1.xml';
const staffRecordsSheetName = 'xl/worksheets/sheet2.xml';
const sharedStringsName = 'xl/sharedStrings.xml';
const schema = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const isNumberRegex = /^[0-9]+(\.[0-9]+)$/;

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
    
    const sst = stringsDoc.querySelector('sst');
    const si = stringsDoc.createElementNS(schema, 'si');
    const t = stringsDoc.createElementNS(schema, 't');

    sst.appendChild(si);
    si.appendChild(t);
    
    t.textContent = textValue;
    vTag.textContent = sharedStringsUniqueCount[0];

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
const identifyLocalAuthority = async postcode => {
  // // need to identify which, if any, of the shared authorities is attributed to the
  // // primary Authority; that is the Local Authority associated with the physical area
  // // of the given Establishment (using the postcode as the key)
  // let primaryAuthorityCssr = null;

  // // lookup primary authority by trying to resolve on specific postcode code
  // const cssrResults = await models.pcodedata.findOne({
  //   where: {
  //     postcode: fetchResults.postcode,
  //   },
  //   include: [
  //     {
  //       model: models.cssr,
  //       as: 'theAuthority',
  //       attributes: ['id', 'name', 'nmdsIdLetter']
  //     }
  //   ]
  // });

  // if (cssrResults && cssrResults.postcode === fetchResults.postcode &&
  //   cssrResults.theAuthority && cssrResults.theAuthority.id &&
  //   Number.isInteger(cssrResults.theAuthority.id)) {

  //   fetchResults.primaryAuthorityCssr = {
  //     id: cssrResults.theAuthority.id,
  //     name: cssrResults.theAuthority.name
  //   };

  // } else {
  //   //  using just the first half of the postcode
  //   const [firstHalfOfPostcode] = fetchResults.postcode.split(' ');

  //   // must escape the string to prevent SQL injection
  //   const fuzzyCssrIdMatch = await models.sequelize.query(
  //     `select "Cssr"."CssrID", "Cssr"."CssR" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(firstHalfOfPostcode)}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR" limit 1`,
  //     {
  //       type: models.sequelize.QueryTypes.SELECT
  //     }
  //   );
  //   if (fuzzyCssrIdMatch && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0].CssrID) {
  //     fetchResults.primaryAuthorityCssr = {
  //       id: fuzzyCssrIdMatch[0].CssrID,
  //       name: fuzzyCssrIdMatch[0].CssR
  //     }
  //   }
  // }

  return 'DEFAULT - KIRKLEES'
};

const getReportData = async (date, thisEstablishment) => {
  // for the report
  const establishmentId = thisEstablishment.id;

  // first run the report, which means running the `cqc.localAuthorityReport` function.
  // this function runs in a single transaction
  // the function returns true or false; encapsulating any SQL exceptions.

  // TODO: Confirm this stored procedure is what populated the tables for the report
  const runReport = await models.sequelize.query(
    `select cqc.localAuthorityReport(:givenEstablishmentId, :givenFromDate, :givenToDate);`,
    {
      replacements: {
        givenEstablishmentId: establishmentId,
        givenFromDate: fromDate,
        givenToDate: toDate,
      },
      type: models.sequelize.QueryTypes.SELECT
    }
  );

  // if report fails return no data
  if(!runReport || !runReport[0].localauthorityreport) {
    return null;
  }

  //Construct the model data object for the report
  const reportData = {
    date: date.toISOString(),
    reportEstablishment: {
      name: thisEstablishment.name,
      nmdsId: thisEstablishment.nmdsId,
      localAuthority: await identifyLocalAuthority(thisEstablishment.postcode)
    },
    establishments: [],
    workers: []
  };

  // now grab the establishments and format the report data
  const reportEstablishments = await models.localAuthorityReportEstablishment.findAll({
    where: {
      establishmentFk: establishmentId
    }
  });

  if(reportEstablishments && Array.isArray(reportEstablishments)) {
    reportData.establishments = reportEstablishments;
  }

  // now grab the workers and format the report data
  const reportWorkers = await models.localAuthorityReportWorker.findAll({
    include: [
      {
        model: models.localAuthorityReportEstablishment,
        as: 'establishment',
        attributes: [],
        where: {
          establishmentFk: establishmentId
        }
      }
    ]
  });

  if(reportWorkers && Array.isArray(reportWorkers)) {
    reportData.workers = reportWorkers;
  }

  return reportData;
};

const updateWorkplacesSheet = (
    workplacesSheet,
    reportData,
    sharedStrings,
    sharedStringsUniqueCount
) => {
  const putString = putStringTemplate.bind(null, workplacesSheet, sharedStrings, sharedStringsUniqueCount);
  
  putString(
      workplacesSheet.querySelector("c[r='B5']"),
      moment(reportData.date).format("DD/MM/YYYY")
    );
    
  putString(
      workplacesSheet.querySelector("c[r='B6']"),
      reportData.reportEstablishment.localAuthority
    );
    
  putString(
      workplacesSheet.querySelector("c[r='B7']"),
      reportData.reportEstablishment.name
    );

  return workplacesSheet;
};

const updateStaffRecordsSheet = (
    staffRecordsSheet,
    reportData,
    sharedStrings,
    sharedStringsUniqueCount
) => {
  const putString = putStringTemplate.bind(null, staffRecordsSheet, sharedStrings, sharedStringsUniqueCount);

  putString(
      staffRecordsSheet.querySelector("c[r='B5']"),
      moment(reportData.date).format("DD/MM/YYYY")
    );
    
  putString(
      staffRecordsSheet.querySelector("c[r='B6']"),
      reportData.reportEstablishment.localAuthority
    );
    
  putString(
      staffRecordsSheet.querySelector("c[r='B7']"),
      reportData.reportEstablishment.name
    );

  return staffRecordsSheet;
}

const getReport = async (date, thisEstablishment) => {
  //const reportData = await getReportData(date, thisEstablishment);

  //some test data
  const reportData = {
    date: date.toISOString(),
    reportEstablishment: {
      name: 'Establishment Name',
      nmdsId: 'Establishment NMDS Id',
      localAuthority: 'Local Authority'
    },
    establishments: [],
    workers: []
  }

  if(reportData === null) {
    return null;
  }

  return (new Promise(resolve => {
      const walker = walk.walk(folderName);
      const outputZip = new JsZip();

      let workplacesSheet, staffRecordsSheet, sharedStrings;

      walker.on("file", (root, fileStats, next) => {
        const zipPath = (root === folderName ? '' : root.replace(/^[^\\\/]*[\\\/]?/, '') + '/') + fileStats.name;

        fs.readFile(`${folderName}/${zipPath}`, (err, fileContent) => {
          if(!err) {
            switch(zipPath) {
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
        const sst = sharedStrings.querySelector("sst");
        
        const sharedStringsUniqueCount = [parseInt(sst.getAttribute('uniqueCount'), 10)];;

        //update the workplaces sheet with the report data and add it to the zip
        outputZip.file(workplacesSheetName, serializeXML(updateWorkplacesSheet(
            workplacesSheet,
            reportData,
            sharedStrings,
            sharedStringsUniqueCount  //pass unique count by reference rather than by value
          )));
          
        //update the staff records sheet with the report data and add it to the zip
        outputZip.file(staffRecordsSheetName, serializeXML(updateStaffRecordsSheet(
            staffRecordsSheet,
            reportData,
            sharedStrings,
            sharedStringsUniqueCount  //pass unique count by reference rather than by value
          )));
          
        //update the shared strings counts we've been keeping track of
        sst.setAttribute('uniqueCount', sharedStringsUniqueCount[0]);
 
        //add the updated shared strings to the zip
        outputZip.file(sharedStringsName, serializeXML(sharedStrings));
        
        resolve(outputZip);
      });
    })).

    then(outputZip => outputZip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    }));
};

//*
(async () => {
  const report = await getReport(new Date(), {});
  const filename = 'output.xlsx';
  fs.createWriteStream(filename).end(report);
  console.log(`${filename} generated!`);
})();

//*/

// gets report
// NOTE - the Local Authority report is driven mainly by pgsql (postgres functions) and therefore does not
//    pass through the Establishment/Worker entities. This is done for performance, as these reports
//    are expected to operate across large sets of data
/*
const express = require('express');
const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
    // first ensure this report can only be ran by those establishments with a Local Authority employer type
    const thisEstablishment = new Establishment(req.username);

    if(await thisEstablishment.restore(req.establishment.id, false)) {
      const theEmployerType = thisEstablishment.employerType;
<<<<<<< HEAD
      if (theEmployerType && (theEmployerType.value).startsWith('Local Authority')) {

        // first run the report, which means running the `cqc.localAuthorityReport` function; the function runs in a single transaction
        // the function returns true or false; encapsulating any SQL exceptions.
        const runReport = await models.sequelize.query(
          `select cqc.localAuthorityReport(:givenEstablishmentId, :givenFromDate, :givenToDate);`,
          {
            replacements: {
              givenEstablishmentId: establishmentId,
              givenFromDate: fromDate,
              givenToDate: toDate,
            },
            type: models.sequelize.QueryTypes.SELECT
          }
        );

        if (runReport && runReport[0].localauthorityreport) {
          // for the report
          const establishmentName = thisEstablishment.name;
          const establishmentNmdsId = thisEstablishment.nmdsId;
          const reportDateUK = moment().format('DD/MM/YYYY');
          const localAuthority = await _identifyLocalAuthority(thisEstablishment.postcode);

          // now grab the establishments and format the report data
          const reportEstablishments = await models.localAuthorityReportEstablishment.findAll({
            where: {
              establishmentFk: establishmentId
            },
            order: [
              ['workplaceName', 'ASC'],
            ],
          });
          if (reportEstablishments && Array.isArray(reportEstablishments)) {
            await workplaceTab(establishmentName, establishmentNmdsId, reportDateUK, localAuthority, reportEstablishments);
          }

          // now grab the workers and format the report data
          const reportWorkers = await models.localAuthorityReportWorker.findAll({
            where: {
              establishmentFk: establishmentId
            },
            order: [
              ['workplaceName', 'ASC'],
              ['localId', 'ASC'],
            ],
          });
          if (reportWorkers && Array.isArray(reportWorkers)) {
            await staffTab(establishmentName, localAuthority, reportWorkers);
          }
=======

      if(theEmployerType && (theEmployerType.value).startsWith('Local Authority')) {
        const date = new Date();
        const report = await getReport(date, thisEstablishment);

        if(report) {
          res.setHeader('Content-disposition',
            `attachment; filename=${moment(date).format("YYYY-MM-DD")}-SFC-Local-Authority-Report.xlsx`);
>>>>>>> added code to produce an xlsx spreadsheet

          res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

          res.setHeader('Content-Length', report.length);

          // the data is already BASE64 encoded
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
//*/
'use strict';

const { downloadContent, saveResponse } = require('./s3');
const { buStates } = require('./states');

const getFileName = (reportType) => {
  switch (reportType) {
    case 'training':
      return 'TrainingResults.txt';

    case 'establishments':
      return 'WorkplaceResults.txt';

    case 'workers':
      return 'StaffrecordsResults.txt';
  }
};

const printLine = (readable, reportType, errors, sep) => {
  Object.keys(errors).forEach((key) => {
    readable.push(`${sep}${key}${sep}`);
    errors[key].forEach((item) => {
      if (reportType === 'training') {
        return readable.push(
          `For worker with ${item.name} and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`,
        );
      } else if (reportType === 'establishments') {
        return readable.push(`For establishment called ${item.name} on line ${item.lineNumber}${sep}`);
      } else if (reportType === 'workers') {
        return readable.push(
          `For worker with LOCALESTID ${item.name} and UNIQUEWORKERID ${item.worker} on line ${item.lineNumber}${sep}`,
        );
      }
    });
  });
};

const reportGet = async (req, res) => {
  const NEWLINE = '\r\n';
  const reportTypes = ['training', 'establishments', 'workers'];
  const reportType = req.params.reportType;
  const readable = [];

  try {
    if (!reportTypes.includes(reportType)) {
      throw new Error(
        `router.route('/report').get - Invalid report type, valid types include - ${reportTypes.join(', ')}`,
      );
    }

    let entities = null;
    let messages = null;
    let differenceReport = null;

    const entityKey = `${req.establishmentId}/intermediary/all.localauthorities.json`;
    const differenceReportKey = `${req.establishmentId}/validation/difference.report.json`;

    try {
      const establishment = await downloadContent(entityKey);
      const differenceReportS3 = await downloadContent(differenceReportKey);
      entities = establishment ? JSON.parse(establishment.data) : null;
      differenceReport = differenceReportS3 ? JSON.parse(differenceReportS3.data) : null;
    } catch (err) {
      throw new Error("router.route('/report').get - failed to download: ", entityKey);
    }

    const reportKey = `${req.establishmentId}/validation/${reportType}.validation.json`;

    try {
      const content = await downloadContent(reportKey);
      messages = content ? JSON.parse(content.data) : null;
    } catch (err) {
      throw new Error("router.route('/report').get - failed to download: ", reportKey);
    }

    const errorTitle = '* Errors (will cause file(s) to be rejected) *';
    const errorPadding = '*'.padStart(errorTitle.length, '*');
    readable.push(`${errorPadding}${NEWLINE}${errorTitle}${NEWLINE}${errorPadding}${NEWLINE}`);

    const errors = messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter((msg) => msg.errCode && msg.errType)
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .reduce(
        (result, item) => ({
          ...result,
          [item.error]: [...(result[item.error] || []), item],
        }),
        {},
      );

    printLine(readable, reportType, errors, NEWLINE);

    const warningTitle = '* Warnings (files will be accepted but data is incomplete or internally inconsistent) *';
    const warningPadding = '*'.padStart(warningTitle.length, '*');
    readable.push(`${NEWLINE}${warningPadding}${NEWLINE}${warningTitle}${NEWLINE}${warningPadding}${NEWLINE}`);

    const warnings = messages
      .reduce((acc, val) => acc.concat(val), [])
      .filter((msg) => msg.warnCode && msg.warnType)
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .reduce((result, item) => ({ ...result, [item.warning]: [...(result[item.warning] || []), item] }), {});

    printLine(readable, reportType, warnings, NEWLINE);

    if (reportType === 'establishments') {
      const laTitle = '* You are sharing data with the following Local Authorities *';
      const laPadding = '*'.padStart(laTitle.length, '*');
      readable.push(`${NEWLINE}${laPadding}${NEWLINE}${laTitle}${NEWLINE}${laPadding}${NEWLINE}`);

      if (entities) {
        entities.forEach((item) => readable.push(`${item}${NEWLINE}`));
      }

      // list all establishments that are being deleted
      if (
        differenceReport &&
        differenceReport.deleted &&
        Array.isArray(differenceReport.deleted) &&
        differenceReport.deleted.length > 0
      ) {
        const deletedTitle = '* Deleted (the following Workplaces will be deleted) *';
        const deletedPadding = '*'.padStart(deletedTitle.length, '*');
        readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

        differenceReport.deleted
          .sort((x, y) => x.name > y.name)
          .forEach((thisDeletedEstablishment) => {
            readable.push(
              `"${thisDeletedEstablishment.name}" (LOCALSTID - ${thisDeletedEstablishment.localId})${NEWLINE}`,
            );
          });
      }
    }

    if (reportType === 'workers') {
      // list all workers that are being deleted
      if (differenceReport) {
        const numberOfDeletedWorkersFromUpdatedEstablishments = differenceReport.updated.reduce(
          (total, current) => total + current.workers.deleted.length,
          0,
        );
        const numberOfDeletedWorkersFromDeletedEstablishments = differenceReport.deleted.reduce(
          (total, current) => total + current.workers.deleted.length,
          0,
        );

        if (numberOfDeletedWorkersFromDeletedEstablishments) {
          const deletedTitle = '* Deleted Workplaces (the following Staff will be deleted) *';
          const deletedPadding = '*'.padStart(deletedTitle.length, '*');
          readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

          differenceReport.deleted
            .sort((x, y) => x.name > y.name)
            .forEach((thisDeletedEstablishment) => {
              if (thisDeletedEstablishment.workers && thisDeletedEstablishment.workers.deleted) {
                thisDeletedEstablishment.workers.deleted
                  .sort((x, y) => x.name > y.name)
                  .forEach((thisWorker) => {
                    readable.push(
                      `"${thisDeletedEstablishment.name}" (LOCALSTID - ${thisDeletedEstablishment.localId}) - "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`,
                    );
                  });
              }
            });
        }

        if (numberOfDeletedWorkersFromUpdatedEstablishments) {
          const deletedTitle = '* Existing Workplaces (the following Staff will be deleted) *';
          const deletedPadding = '*'.padStart(deletedTitle.length, '*');
          readable.push(`${NEWLINE}${deletedPadding}${NEWLINE}${deletedTitle}${NEWLINE}${deletedPadding}${NEWLINE}`);

          differenceReport.updated
            .sort((x, y) => x.name > y.name)
            .forEach((thisUpdatedEstablishment) => {
              if (thisUpdatedEstablishment.workers && thisUpdatedEstablishment.workers.deleted) {
                thisUpdatedEstablishment.workers.deleted
                  .sort((x, y) => x.name > y.name)
                  .forEach((thisWorker) => {
                    readable.push(
                      `"${thisUpdatedEstablishment.name}" (LOCALSTID - ${thisUpdatedEstablishment.localId})- "${thisWorker.name}" (UNIQUEWORKERID - ${thisWorker.localId})${NEWLINE}`,
                    );
                  });
              }
            });
        }
      }
    }

    await saveResponse(req, res, 200, readable.join(NEWLINE), {
      'Content-Type': 'text/plain',
      'Content-disposition': `attachment; filename=${getFileName(reportType)}`,
    });
  } catch (err) {
    console.error(err);
    await saveResponse(req, res, 500, {});
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/:reportType').get(acquireLock.bind(null, reportGet, buStates.DOWNLOADING, true));

module.exports = router;
module.exports.printLine = printLine;

'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const s3 = require('../../../../../routes/establishments/bulkUpload/s3');
const errorReport = require('../../../../../routes/establishments/bulkUpload/errorReport');
const httpMocks = require('node-mocks-http');
const {
  establishmentErrorsWarnings,
  workerErrorsWarnings,
  trainingErrorsWarnings,
  establishmentErrorWarnings,
} = require('../../../mockdata/bulkUpload');

const Excel = require('exceljs');

describe('/server/routes/establishment/bulkUpload/errorReport.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('errorReport', () => {
    const establishmentId = 123;

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/bulkUpload/errorReport`,
      params: {
        establishmentId,
      },
    });

    req.establishment = {
      id: establishmentId,
    };

    const res = httpMocks.createResponse();
    it('should reply with a 200 status', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('establishments')) {
          return { data: '[]' };
        } else if (url.includes('workers')) {
          return { data: '[]' };
        } else {
          return { data: '[]' };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.establishments.errors.length).to.deep.equal(0);
        expect(value.establishments.warnings.length).to.deep.equal(0);
        expect(value.workers.errors.length).to.deep.equal(0);
        expect(value.workers.warnings.length).to.deep.equal(0);
        expect(value.training.errors.length).to.deep.equal(0);
        expect(value.training.warnings.length).to.deep.equal(0);
      });
      await errorReport.errorReport(req, res);
    });

    it('should reply with 2 errors, 1 warning with 2 establishments for 1 error', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('establishments')) {
          return {
            data: establishmentErrorsWarnings,
          };
        } else {
          return { data: '[]' };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.establishments.errors.length).to.deep.equal(2);
        expect(value.establishments.warnings.length).to.deep.equal(1);
        expect(value.establishments.errors).to.deep.equal([
          {
            origin: 'Establishments',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
            ],
          },
          {
            origin: 'Establishments',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.workers.errors.length).to.deep.equal(0);
        expect(value.workers.warnings.length).to.deep.equal(0);
        expect(value.training.errors.length).to.deep.equal(0);
        expect(value.training.warnings.length).to.deep.equal(0);
      });
      await errorReport.errorReport(req, res);
    });

    it('should reply with 2 errors, 1 warning with 2 workers for 1 error', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('workers')) {
          return {
            data: workerErrorsWarnings,
          };
        } else {
          return { data: '[]' };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.workers.errors.length).to.deep.equal(2);
        expect(value.workers.warnings.length).to.deep.equal(1);
        expect(value.workers.errors).to.deep.equal([
          {
            origin: 'Workers',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
            ],
          },
          {
            origin: 'Workers',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.establishments.errors.length).to.deep.equal(0);
        expect(value.establishments.warnings.length).to.deep.equal(0);
        expect(value.training.errors.length).to.deep.equal(0);
        expect(value.training.warnings.length).to.deep.equal(0);
      });
      await errorReport.errorReport(req, res);
    });

    it('should reply with 2 errors. 1 warning with 3 types of training for 1 error', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('training')) {
          return {
            data: trainingErrorsWarnings,
          };
        } else {
          return { data: '[]' };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.training.errors.length).to.deep.equal(2);
        expect(value.training.warnings.length).to.deep.equal(1);
        expect(value.training.errors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
              { lineNumber: 6, name: 'Test2', source: '' },
            ],
          },
          {
            origin: 'Training',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.establishments.errors.length).to.deep.equal(0);
        expect(value.establishments.warnings.length).to.deep.equal(0);
        expect(value.workers.errors.length).to.deep.equal(0);
        expect(value.workers.warnings.length).to.deep.equal(0);
      });
      await errorReport.errorReport(req, res);
    });
    it('should reply errors and warnings for all files', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('training')) {
          return { data: trainingErrorsWarnings };
        } else if (url.includes('establishments')) {
          return { data: establishmentErrorsWarnings };
        } else {
          return { data: workerErrorsWarnings };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.training.errors.length).to.deep.equal(2);
        expect(value.training.warnings.length).to.deep.equal(1);
        expect(value.training.errors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
              { lineNumber: 6, name: 'Test2', source: '' },
            ],
          },
          {
            origin: 'Training',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.establishments.errors.length).to.deep.equal(2);
        expect(value.establishments.warnings.length).to.deep.equal(1);
        expect(value.establishments.errors).to.deep.equal([
          {
            origin: 'Establishments',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
            ],
          },
          {
            origin: 'Establishments',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.workers.errors.length).to.deep.equal(2);
        expect(value.workers.warnings.length).to.deep.equal(1);
        expect(value.workers.errors).to.deep.equal([
          {
            origin: 'Workers',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
            ],
          },
          {
            origin: 'Workers',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
      });
      await errorReport.errorReport(req, res);
    });
    it('should reply with 1 error and warning for establishment file', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('training')) {
          return { data: trainingErrorsWarnings };
        } else if (url.includes('establishments')) {
          return { data: establishmentErrorWarnings };
        } else {
          return { data: workerErrorsWarnings };
        }
      });
      sinon.stub(s3, 'saveResponse').callsFake(async (req, res, statusCode, value) => {
        expect(statusCode).to.deep.equal(200);
        expect(value.training.errors.length).to.deep.equal(2);
        expect(value.training.warnings.length).to.deep.equal(1);
        expect(value.training.errors).to.deep.equal([
          {
            origin: 'Training',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
              { lineNumber: 6, name: 'Test2', source: '' },
            ],
          },
          {
            origin: 'Training',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
        expect(value.establishments.errors.length).to.deep.equal(1);
        expect(value.establishments.warnings.length).to.deep.equal(1);
        expect(value.establishments.errors).to.deep.equal([
          {
            origin: 'Establishments',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' }],
          },
        ]);
        expect(value.workers.errors.length).to.deep.equal(2);
        expect(value.workers.warnings.length).to.deep.equal(1);
        expect(value.workers.errors).to.deep.equal([
          {
            origin: 'Workers',
            errCode: 1280,
            errType: 'ALL_JOBS_ERROR',
            error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
            items: [
              { lineNumber: 2, name: 'SKILLS FOR CARE', source: '8;3;38' },
              { lineNumber: 3, name: 'Test', source: '' },
            ],
          },
          {
            origin: 'Workers',
            errCode: 1110,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID has not been supplied',
            items: [{ lineNumber: 2, name: 'SKILLS FOR CARE', source: '' }],
          },
        ]);
      });
      await errorReport.errorReport(req, res);
    });
  });

  describe('getColumnName', () => {
    it('should be able to find column names in error messages', async () => {
      const columnNames = ['COLUMN1', 'COLUMN2', 'COLUMN3'];
      const errorMessage = 'COLUMN1  are NOT filled out';

      const result = errorReport.getColumnName(errorMessage, columnNames);

      expect(result).to.equal('COLUMN1');
    });
    it('should be able to find more than one column names in error messages', async () => {
      const columnNames = ['COLUMN1', 'COLUMN2', 'COLUMN3'];
      const errorMessage = 'COLUMN1 and COLUMN3 are NOT filled out';

      const result = errorReport.getColumnName(errorMessage, columnNames);

      expect(result).to.equal('COLUMN1/COLUMN3');
    });
  });
  describe('generateBUReport', () => {
    const establishmentId = 123;

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/bulkUpload/errorReport/report`,
      params: {
        establishmentId,
      },
      options: {
        observe: 'response',
        responseType: 'blob',
      },
    });

    req.establishmentId = establishmentId;

    const res = httpMocks.createResponse();
    it('should return status 200 and an excel format', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('establishments')) {
          return { data: establishmentErrorsWarnings };
        } else if (url.includes('workers')) {
          return { data: workerErrorsWarnings };
        } else {
          return { data: trainingErrorsWarnings };
        }
      });
      await errorReport.generateBUReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      console.log(res);
    });
    it.only('should return correct data', async () => {
      sinon.stub(s3, 'downloadContent').callsFake(async (url) => {
        if (url.includes('establishments')) {
          return { data: establishmentErrorsWarnings };
        } else if (url.includes('workers')) {
          return { data: workerErrorsWarnings };
        } else {
          return { data: trainingErrorsWarnings };
        }
      });
      await errorReport.generateBUReport(req, res);

      expect(res.statusCode).to.equal(200);
      var workbook = new Excel.Workbook();
      console.log(res);

      workbook.xlsx.readFile(res.body).then(function () {
        console.log('Heello');
        var worksheet = workbook.getWorksheet('Workplace');
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
          expect(rowNumber).to.equal(200);
        });
      });
    });
  });
});

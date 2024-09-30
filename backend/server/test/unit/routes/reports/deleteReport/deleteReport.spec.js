'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const excelJS = require('exceljs');

const deleteReport = require('../../../../../routes/reports/deleteReport/report');
const models = require('../../../../../models');

const { rawDataBuilder } = require('../../../../factories/deleteReport/deleteReport');

describe('/server/routes/reports/deleteReport/report', () => {
  describe('deleteReport()', () => {
    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/deleteReport/report',
      });
      res = httpMocks.createResponse();

      sinon.stub(models.pcodedata, 'getLinkedCssrRecordsFromPostcode').callsFake(async () => {
        return {};
      });
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should return status 200 and an excel format', async () => {
      sinon.stub(models.establishment, 'generateDeleteReportData').callsFake(async () => {
        return [rawDataBuilder(), rawDataBuilder(), rawDataBuilder()];
      });

      await deleteReport.generateDeleteReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    describe('fillData', () => {
      let workbook;
      let mockWorksheet;

      beforeEach(() => {
        workbook = new excelJS.Workbook();

        mockWorksheet = workbook.addWorksheet('To be deleted', { views: [{ showGridLines: false }] });
      });

      it('should fill next B cell with workplace name', async () => {
        const workplaceData = rawDataBuilder();
        const expectedWorkplaceName = workplaceData.NameValue;

        deleteReport.fillData([workplaceData], {}, mockWorksheet);

        expect(mockWorksheet.getCell('B1').value).to.equal(expectedWorkplaceName);
      });

      it('should fill next C cell with concatenated address lines', async () => {
        const workplaceData = rawDataBuilder();

        deleteReport.fillData([workplaceData], {}, mockWorksheet);

        const addressCell = mockWorksheet.getCell('C1').value;
        expect(addressCell).to.include(workplaceData.address1);
        expect(addressCell).to.include(workplaceData.address2);
        expect(addressCell).to.include(workplaceData.address3);
        expect(addressCell).to.include(workplaceData.town);
        expect(addressCell).to.include(workplaceData.county);
      });
    });
  });
});

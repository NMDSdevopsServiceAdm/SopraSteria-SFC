'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const moment = require('moment');
const httpMocks = require('node-mocks-http');

const deleteReport = require('../../../../../routes/reports/deleteReport/report');
const models = require('../../../../../models');

const { rawDataBuilder } = require('../../../../factories/deleteReport/deleteReport');

describe('/server/routes/reports/deleteReport/report', () => {
  describe('deleteReport()', () => {
    beforeEach(() => {
      sinon.stub(models.pcodedata, 'getCssrFromPostcode').callsFake(async () => {
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
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/deleteReport/report',
      });
      const res = httpMocks.createResponse();

      await deleteReport.generateDeleteReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
    describe('getLastUpdate()', () => {
      it('should return that worker has the latest update', () => {
        const rawData = rawDataBuilder();
        rawData.updated = moment().subtract(5, 'months').toISOString();
        rawData.workers = [{ updated: moment().subtract(1, 'months').toISOString() }];

        const result = deleteReport.getLastUpdate(rawData);
        expect(result).to.equal(rawData.workers[0].updated);
      });
    });
    describe('filterData()', () => {
      it('should return only the none updated establishments', async () => {
        const rawData = [rawDataBuilder(), rawDataBuilder(), rawDataBuilder()];
        rawData[0].updated = moment().subtract(deleteReport.monthsWithoutUpdate, 'months').toISOString(); // Out of Date
        rawData[1].updated = moment()
          .subtract(deleteReport.monthsWithoutUpdate - 10, 'months')
          .toISOString(); // In Date
        rawData[2].updated = moment()
          .subtract(deleteReport.monthsWithoutUpdate - 10, 'months')
          .toISOString(); // In Date

        const result = await deleteReport.filterData(rawData);
        expect(result.length).to.equal(1);
      });
      it('should return only the none updated establishments and workers', async () => {
        const rawData = [rawDataBuilder(), rawDataBuilder(), rawDataBuilder()];
        rawData[0].updated = moment()
          .subtract(deleteReport.monthsWithoutUpdate + 5, 'months')
          .toISOString(); // Out of Date
        rawData[1].updated = moment()
          .subtract(deleteReport.monthsWithoutUpdate - 10, 'months')
          .toISOString(); // In Date
        rawData[2].updated = moment().subtract(deleteReport.monthsWithoutUpdate, 'months').toISOString(); // Out of Date

        rawData[0].workers = [{ updated: moment().subtract(deleteReport.monthsWithoutUpdate, 'months').toISOString() }]; // Out of Date
        rawData[1].workers = [
          {
            updated: moment()
              .subtract(deleteReport.monthsWithoutUpdate - 10, 'months')
              .toISOString(),
          },
        ]; // In Date
        rawData[2].workers = [
          {
            updated: moment()
              .subtract(deleteReport.monthsWithoutUpdate - 10, 'months')
              .toISOString(),
          },
        ]; // In Date

        const result = await deleteReport.filterData(rawData);

        expect(result.length).to.equal(1);
        expect(result[0].id).to.deep.equal(rawData[0].id);
      });
    });
  });
});
